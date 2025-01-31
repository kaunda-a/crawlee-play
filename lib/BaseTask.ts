import { Action } from '@/types/Action';
import { chromium, firefox, webkit, Browser, Page, BrowserContext } from 'playwright';
import { ProxyRotator } from './ProxyRotator';
import { BehaviorSimulator } from './BehaviorSimulator';
import { CaptchaSolver } from './CaptchaSolver';
import { FingerprintManager } from './FingerprintManager';
import { UserAgentRotator } from '../config/UserAgentRotator';
import { NetworkObfuscator } from './NetworkObfuscator';
import { HeadlessModeEvasion } from './HeadlessModeEvasion';
import { ExtensionEmulator } from './ExtensionEmulator';
import { CacheManager } from './CacheManager';
import { BrowserVersionManager } from './BrowserVersionManager';

export interface BrowserFingerprint {
  userAgent: string;
  hardwareConcurrency: number;
  deviceMemory: number;
  platform: string;
  timezone: string;
  locale: string;
  webGLVendor: string;
  webGLRenderer: string;
  screenResolution: string;
  availableScreenResolution: string;
  colorDepth: number;
  pixelRatio: number;
}

export class BotManager {
  private bots: Map<string, Browser> = new Map();

  async createBot(botName: string, botType: string): Promise<Browser> {
    const browserType = botType === 'firefox' ? firefox : botType === 'webkit' ? webkit : chromium;
    const browser = await browserType.launch();
    this.bots.set(botName, browser);
    return browser;
  }

  getBot(botName: string): Browser | undefined {
    return this.bots.get(botName);
  }

  async closeBot(botName: string): Promise<void> {
    const bot = this.bots.get(botName);
    if (bot) {
      await bot.close();
      this.bots.delete(botName);
    }
  }
}

export abstract class BaseTask {
  protected userAgentRotator: UserAgentRotator;
  protected networkObfuscator: NetworkObfuscator;
  protected headlessModeEvasion: HeadlessModeEvasion;
  protected extensionEmulator: ExtensionEmulator;
  protected cacheManager: CacheManager;
  protected browserVersionManager: BrowserVersionManager;

  public type: string;
  public parameters: any;
  public actions: Action[];

  constructor(
    type: string,
    parameters: any,
    actions: Action[],
    protected proxyRotator: ProxyRotator,
    protected behaviorSimulator: BehaviorSimulator,
    protected captchaSolver: CaptchaSolver,
    protected fingerprintManager: FingerprintManager
  ) {
    this.type = type;
    this.parameters = parameters;
    this.actions = actions;
    this.userAgentRotator = new UserAgentRotator();
    this.networkObfuscator = new NetworkObfuscator();
    this.headlessModeEvasion = new HeadlessModeEvasion();
    this.extensionEmulator = new ExtensionEmulator();
    this.cacheManager = new CacheManager(`cache_${parameters.id}.json`);
    this.browserVersionManager = new BrowserVersionManager();
  }

  abstract execute(browser: Browser, context: BrowserContext, page: Page): Promise<any>;
  protected async executeActions(page: Page) {
    for (const action of this.actions) {
      switch (action.type) {
        case 'click':
          await page.click(action.selector!);
          break;
        case 'type':
          await page.fill(action.selector!, action.value!);
          break;
        case 'wait':
          await page.waitForTimeout(action.duration!);
          break;
        case 'scroll':
          if (typeof action.value === 'number') {
            await page.evaluate((value) => window.scrollBy(0, value), action.value);
          }
          break;
        case 'moveMouse':
          if (typeof action.x === 'number' && typeof action.y === 'number') {
            await page.mouse.move(action.x, action.y);
          }
          break;
        case 'dragAndDrop':
          await page.dragAndDrop(action.sourceSelector!, action.targetSelector!);
          break;
        case 'hover':
          await page.hover(action.selector!);
          break;
        default:
          console.warn(`Unknown action type: ${action['type']}`);
      }
    }
  }

  public async setupContext(browser: Browser): Promise<BrowserContext> {
    const context = await browser.newContext({
      ...this.fingerprintManager.generateFingerprint(),
    });
    await this.headlessModeEvasion.applyEvasionTechniques(context);
    await this.extensionEmulator.emulateCommonExtensions(context);
    await this.cacheManager.loadCacheAndCookies(context);
    return context;
  }

  protected async applyFingerprint(page: Page, fingerprint: BrowserFingerprint): Promise<void> {
    await page.addInitScript((fp) => {
      Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => fp.hardwareConcurrency });
      Object.defineProperty(navigator, 'deviceMemory', { get: () => fp.deviceMemory });
      Object.defineProperty(navigator, 'platform', { get: () => fp.platform });
    }, fingerprint);
  }

  protected async handleCaptchas(page: Page): Promise<void> {
    const captchaDetected = await this.captchaSolver.detectCaptcha(page);
    if (captchaDetected) {
      await this.captchaSolver.solveCaptcha(page.url(), await this.extractSiteKey(page));
    }
  }

  private async extractSiteKey(page: Page): Promise<string> {
    const siteKey = await page.evaluate(() => {
      const element = document.querySelector('.g-recaptcha');
      return element ? element.getAttribute('data-sitekey') : null;
    });
    if (!siteKey) {
      throw new Error('Failed to extract site key');
    }
    return siteKey;
  }

  protected async randomDelay(): Promise<void> {
    const delay = Math.floor(Math.random() * 1000) + 500;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

export class TaskManager {
  private taskQueue: BaseTask[] = [];
  private runningTasks: Set<BaseTask> = new Set();
  private maxConcurrentTasks: number = 5;
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;

  constructor(
    private botManager: BotManager,
    private proxyRotator: ProxyRotator,
    private behaviorSimulator: BehaviorSimulator,
    private captchaSolver: CaptchaSolver,
    private fingerprintManager: FingerprintManager
  ) {}

  setBrowser(browser: Browser) {
    this.browser = browser;
  }

  setContext(context: BrowserContext) {
    this.context = context;
  }

  setPage(page: Page) {
    this.page = page;
  }

  async addTask(task: BaseTask): Promise<void> {
    this.taskQueue.push(task);
    await this.scheduleTasks();
  }

  private async scheduleTasks(): Promise<void> {
    while (this.runningTasks.size < this.maxConcurrentTasks && this.taskQueue.length > 0) {
      const task = this.taskQueue.shift();
      if (task) {
        this.runningTasks.add(task);
        this.executeTask(task).finally(() => {
          this.runningTasks.delete(task);
          this.scheduleTasks();
        });
      }
    }
  }

  private async executeTask(task: BaseTask): Promise<void> {
    if (!this.browser || !this.context || !this.page) {
      throw new Error('Browser, context, or page not set');
    }

    try {
      const result = await task.execute(this.browser, this.context, this.page);
      console.log('Task execution result:', result);
    } catch (error) {
      console.error('Error executing task:', error);
    }
  }

  async startTaskExecution(): Promise<any> {
    if (!this.browser || !this.context || !this.page) {
      throw new Error('Browser, context, or page not set');
    }

    if (this.taskQueue.length > 0) {
      const task = this.taskQueue.shift();
      if (task) {
        return await this.executeTask(task);
      }
    }
    return null;
  }
}

