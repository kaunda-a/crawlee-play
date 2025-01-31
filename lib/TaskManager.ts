import PriorityQueue from 'priorityqueuejs';
import { v4 as uuidv4 } from 'uuid';
import { Action } from '@/types/Action';
import { ProxyRotator } from './ProxyRotator';
import { BehaviorSimulator } from './BehaviorSimulator';
import { CaptchaSolver } from './CaptchaSolver';
import { FingerprintManager } from './FingerprintManager';
import { BaseTask } from './BaseTask';
import {  GoogleSearch } from './GoogleSearch';
import { Browser, BrowserContext } from 'playwright-core';
import { Page } from 'playwright';

interface Task {
  execute: (browser: Browser, context: BrowserContext, page: Page) => Promise<any>;
  retries: number;
  maxRetries: number;
  onComplete: (result: any) => void;
  onError: (error: Error) => void;
  id: string;
  type: string;
  parameters: any;
  actions: Action[];
  priority: number;
  progress: number;
  updateProgress: (progress: number) => void;
  cancel: () => Promise<void>;
  duration: number;
  scheduledTime?: Date;
}

export class TaskManager {
  private taskQueue: PriorityQueue<Task>;
  private runningTasks: Set<Task> = new Set();
  private maxConcurrentTasks: number = 5;
  private context: BrowserContext | null = null;
  private browser: Browser | null = null;
  private page: Page | null = null;
 

  constructor(
    private proxyRotator: ProxyRotator,
    private behaviorSimulator: BehaviorSimulator,
    private captchaSolver: CaptchaSolver,
    private fingerprintManager: FingerprintManager
  ) {
    this.taskQueue = new PriorityQueue<Task>((a, b) => b.priority - a.priority);
  }

  setBrowser(browser: Browser) {
    this.browser = browser;
  }

  setContext(context: BrowserContext) {
    this.context = context;
  }

  setPage(page: Page) {
    this.page = page;
  }

  createTask(taskType: string, parameters: any, actions: Action[]): BaseTask {
    if (taskType === 'GoogleSearch' && !parameters.searchQuery) {
      throw new Error('Search query is required for GoogleSearch tasks');
    }
    console.log('TaskManager: Creating task of type:', taskType);
    const TaskClass = {
      GoogleSearch: GoogleSearch,
    }[taskType];

    if (!TaskClass) {
      throw new Error(`Unknown task type: ${taskType}`);
    }

    this.validateTaskParameters(taskType, parameters);

    return new TaskClass(taskType, parameters, actions, this.proxyRotator, this.behaviorSimulator, this.captchaSolver, this.fingerprintManager, this);
  }

  private validateTaskParameters(taskType: string, parameters: any): void {
    switch (taskType) {
      case 'WebScraping':
        if (!parameters.url) throw new Error('URL is required for WebScraping tasks');
        break;
      case 'GoogleSearch':
        if (!parameters.searchQuery) throw new Error('Search query is required for GoogleSearch tasks');
        break;
    }
  }

  async scheduleTask(task: BaseTask, scheduledTime: Date, priority: number = 1): Promise<void> {
    const fullTask: Task = this.createFullTask(task, priority);
    fullTask.scheduledTime = scheduledTime;
    this.taskQueue.enq(fullTask);
    this.scheduleTaskExecution(fullTask);
  }

  private scheduleTaskExecution(task: Task): void {
    const now = new Date();
    const delay = task.scheduledTime ? task.scheduledTime.getTime() - now.getTime() : 0;
    if (delay > 0) {
      setTimeout(() => this.executeScheduledTask(task), delay);
    } else {
      this.executeScheduledTask(task);
    }
  }

  private async executeScheduledTask(task: Task): Promise<void> {
    this.taskQueue.deq();
    await this.executeTask(task);
  }

  async addTask(task: BaseTask, duration: number = 0, priority: number = 1): Promise<void> {
    console.log(`Adding task: ${task.type} with priority ${priority}`);
    const fullTask = this.createFullTask(task, priority, duration);
    this.taskQueue.enq(fullTask);
    console.log(`Task added to queue. Queue size: ${this.taskQueue.size()}`);
    await this.scheduleTasks();
  }

  private createFullTask(task: BaseTask, priority: number, duration: number = 0): Task {
    const fullTask: Task = {
      ...task,
      type: task.type,
      parameters: task.parameters,
      actions: task.actions,
      retries: 0,
      maxRetries: 3,
      onComplete: () => {},
      onError: () => {},
      id: uuidv4(),
      execute: (browser: Browser, context: BrowserContext, page: Page) => task.execute(browser, context, page),
      priority,
      progress: 0,
      updateProgress: (progress: number) => {
        fullTask.progress = progress;
        console.log(`Task ${fullTask.id} progress: ${progress}%`);
      },
      cancel: async () => {
        console.log(`Cancelling task ${fullTask.id}`);
      },
      duration
    };
    return fullTask;
  }

  private async scheduleTasks(): Promise<void> {
    console.log('Scheduling tasks. Running tasks:', this.runningTasks.size);
    while (this.runningTasks.size < this.maxConcurrentTasks && !this.taskQueue.isEmpty()) {
      const task = this.taskQueue.deq();
      console.log(`Scheduling task: ${task.id} (${task.type})`);
      this.runningTasks.add(task);
      this.executeTask(task).finally(() => {
        this.runningTasks.delete(task);
        this.scheduleTasks();
      });
    }
  }

  private async executeTask(task: Task, maxRetries = 3): Promise<void> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(`Executing task: ${task.id} (${task.type}), attempt ${attempt + 1}`);
        if (!this.browser || !this.context || !this.isPageValid()) {
          throw new Error('Browser, context, or page not set or is closing');
        }
        
        if (!(await this.isBrowserConnected(this.browser))) {
          throw new Error('Browser is no longer connected');
        }

        await this.checkNetworkAndPageLoad();

        const result = await task.execute(this.browser, this.context, this.page!);
        console.log(`Task ${task.id} execution result:`, result);
        task.onComplete(result);
        return;
      } catch (error) {
        console.error(`Error executing task ${task.id} (attempt ${attempt + 1}):`, error);
        if (attempt === maxRetries - 1) {
          console.error(`Max retries reached for task ${task.id}. Task failed.`);
          task.onError(error instanceof Error ? error : new Error(String(error)));
        } else {
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    }
  }

  private async checkNetworkAndPageLoad(): Promise<void> {
    try {
      await this.page!.waitForLoadState('networkidle', { timeout: 30000 });
      console.log('Page loaded successfully');
    } catch (error) {
      console.error('Error during page load:', error);
      throw error;
    }
  }
  
  private isPageValid(): boolean {
    return this.page !== null && !this.page.isClosed();
  }

  private async isBrowserConnected(browser: Browser): Promise<boolean> {
    try {
      await browser.contexts();
      return true;
    } catch {
      return false;
    }
  }

  async startTaskExecution(): Promise<any> {
    if (!this.browser || !this.context) {
      throw new Error('Browser instance or context not set');
    }
    console.log('TaskManager: Starting task execution');
    console.log('TaskManager: Current task queue:', this.taskQueue);
    if (!this.taskQueue.isEmpty()) {
      const task = this.taskQueue.deq();
      console.log('TaskManager: Executing task:', task);
      return await this.executeTask(task);
    } else {
      console.log('TaskManager: No tasks in queue');
      return null;
    }
  }

  async cancelTask(taskId: string): Promise<void> {
    const runningTask = Array.from(this.runningTasks).find(t => t.id === taskId);
    if (runningTask) {
      await runningTask.cancel();
      this.runningTasks.delete(runningTask);
    } else {
      const queuedTasks = this.queueToArray();
      const queuedTaskIndex = queuedTasks.findIndex(t => t.id === taskId);
      if (queuedTaskIndex !== -1) {
        queuedTasks.splice(queuedTaskIndex, 1);
        this.taskQueue = new PriorityQueue<Task>((a, b) => b.priority - a.priority);
        queuedTasks.forEach(task => this.taskQueue.enq(task));
      }
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    const queuedTasks = this.queueToArray();
    const taskIndex = queuedTasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
      queuedTasks.splice(taskIndex, 1);
      this.taskQueue = new PriorityQueue<Task>((a, b) => b.priority - a.priority);
      queuedTasks.forEach(task => this.taskQueue.enq(task));
    } else {
      throw new Error('Task not found');
    }
  }

  async addActionToTask(taskId: string, action: Action): Promise<void> {
    const queuedTasks = this.queueToArray();
    const task = queuedTasks.find(t => t.id === taskId);
    if (task) {
      task.actions.push(action);
      this.taskQueue = new PriorityQueue<Task>((a, b) => b.priority - a.priority);
      queuedTasks.forEach(task => this.taskQueue.enq(task));
    } else {
      throw new Error('Task not found');
    }
  }

  async updateTask(taskId: string, updatedTask: Partial<Task>): Promise<void> {
    const queuedTasks = this.queueToArray();
    const taskIndex = queuedTasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
      queuedTasks[taskIndex] = { ...queuedTasks[taskIndex], ...updatedTask };
      this.taskQueue = new PriorityQueue<Task>((a, b) => b.priority - a.priority);
      queuedTasks.forEach(task => this.taskQueue.enq(task));
    } else {
      throw new Error('Task not found');
    }
  }

  async keepBrowserOpen(browser: Browser, duration?: number) {
    if (duration && duration > 0) {
      await new Promise(resolve => setTimeout(resolve, duration * 60 * 1000));
      await browser.close();
    } else {
      await new Promise(() => {});
    }
  }

  async getTaskStatus(taskId: string): Promise<{ status: string; progress: number } | null> {
    const runningTask = Array.from(this.runningTasks).find(t => t.id === taskId);
    if (runningTask) {
      return { status: 'running', progress: runningTask.progress };
    }
    const queuedTask = this.queueToArray().find(t => t.id === taskId);
    if (queuedTask) {
      return { status: 'queued', progress: 0 };
    }
    return null;
  }

  async pauseTask(taskId: string): Promise<void> {
    const task = Array.from(this.runningTasks).find(t => t.id === taskId);
    if (task) {
      console.log(`Pausing task ${taskId}`);
    }
  }

  async resumeTask(taskId: string): Promise<void> {
    const task = this.queueToArray().find(t => t.id === taskId);
    if (task) {
      console.log(`Resuming task ${taskId}`);
    }
  }

  private queueToArray(): Task[] {
    const array: Task[] = [];
    const tempQueue = new PriorityQueue<Task>((a, b) => b.priority - a.priority);
    
    while (!this.taskQueue.isEmpty()) {
      const task = this.taskQueue.deq();
      array.push(task);
      tempQueue.enq(task);
    }

    this.taskQueue = tempQueue;
    return array;
  }
}
