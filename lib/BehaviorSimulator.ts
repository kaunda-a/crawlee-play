import { Page, Browser, BrowserContext } from 'playwright-core';
import { Action } from '@/types/Action';
interface  BehaviorSimulatorOptions {
  mouseMoveInterval?: number;
  scrollInterval?: number;
  scrollAmount?: number;
  mouseMoveSteps?: number;
  actionInterval?: number;
}

export class  BehaviorSimulator {
  private page: Page;
  private browser: Browser;
  private context: BrowserContext;
  private options:  BehaviorSimulatorOptions;
  private mouseMoveIntervalId?: NodeJS.Timeout;
  private scrollIntervalId?: NodeJS.Timeout;
  private isRunning: boolean = false;
  private isEnhancedInstance: boolean = false;

  constructor(page: Page, browser: Browser, context: BrowserContext, options: BehaviorSimulatorOptions = {}, isEnhancedInstance: boolean = false) {
    this.page = page;
    this.browser = browser;
    this.context = context;
    this.options = {
      mouseMoveInterval: options.mouseMoveInterval || 3000,
      scrollInterval: options.scrollInterval || 5000,
      scrollAmount: options.scrollAmount || 100,
      mouseMoveSteps: options.mouseMoveSteps || 10,
    };
    this.isEnhancedInstance = isEnhancedInstance;
    if (this.page && typeof this.page.on === 'function') {
      this.page.on('framenavigated', () => this.handleNavigation());
    }
  }
  

  private isPageValid(): boolean {
    return !!this.page && typeof this.page.url === 'function' && this.isRunning;
  }

  public async start() {
    if (!this.isEnhancedInstance) {
      console.log('AutomatedBrowsing is only available in enhanced mode.');
      return;
    }

    this.isRunning = true;
    await this.page.waitForLoadState('domcontentloaded');
    await this.showCustomCursor();

    if (this.mouseMoveIntervalId) clearInterval(this.mouseMoveIntervalId);
    if (this.scrollIntervalId) clearInterval(this.scrollIntervalId);

    this.mouseMoveIntervalId = setInterval(() => {
      if (this.isRunning) this.simulateRandomMouseMovements();
    }, this.options.mouseMoveInterval);

    this.scrollIntervalId = setInterval(() => {
      if (this.isRunning) this.scrollPage();
    }, this.options.scrollInterval);
  }

  public stop() {
    this.isRunning = false;
    if (this.mouseMoveIntervalId) clearInterval(this.mouseMoveIntervalId);
    if (this.scrollIntervalId) clearInterval(this.scrollIntervalId);
  }

  public pause() {
    this.isRunning = false;
  }

  public resume() {
    this.isRunning = true;
    this.start();
  }

  private async handleNavigation() {
    this.pause();
    try {
      await this.page.waitForNavigation({ waitUntil: 'networkidle', timeout: 60000 });
      await this.showCustomCursor();
      this.resume();
    } catch (error) {
      console.error('Navigation error:', error);
      await this.handleError(error as Error);
    }
  }
  private async waitForStableNetwork(page: Page, timeout = 30000): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      try {
        await page.evaluate(() => {
          return new Promise<void>((resolve) => {
            if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
              if (navigator.onLine) {
                resolve();
              } else {
                window.addEventListener('online', () => resolve(), { once: true });
              }
            } else {
              // If navigator.onLine is not available, assume online after a short delay
              setTimeout(resolve, 1000);
            }
          });
        });
        return;
      } catch (error) {
        console.log('Network check error:', error);
        await page.waitForTimeout(1000);
      }
    }
    throw new Error('Network did not stabilize');
  }
  
  
  private async simulateRandomMouseMovements(): Promise<void> {
    console.log('Simulating random mouse movements');
    if (!this.isPageValid()) return;
    try {
      const viewportSize = await this.page.viewportSize();
      if (viewportSize) {
        const start = await this.page.evaluate(() => ({ x: (window as any).mouseX || 0, y: (window as any).mouseY || 0 }));
        const end = {
          x: Math.random() * viewportSize.width,
          y: Math.random() * viewportSize.height,
        };
        const curve = this.generateBezierCurve(start, end);
        console.log(`Generated ${curve.length} points for mouse movement`);
       
        for (const point of curve) {
          if (!this.isRunning) break;
          await this.moveCustomCursor(point.x, point.y);
          console.log(`Moved cursor to (${point.x}, ${point.y})`);
          await this.page.waitForTimeout(this.getRandomDuration(50, 150));
        }
      }
    } catch (error) {
      console.error('Error in simulateRandomMouseMovements:', error);
      await this.handleError(error as Error);
    }
  }

  private async scrollPage() {
    if (!this.isPageValid()) return;
  
    try {
      const scrollAmount = this.options.scrollAmount;
      await this.page.evaluate((amount) => {
        return new Promise<void>((resolve) => {
          window.scrollBy({ top: amount, left: 0, behavior: 'smooth' });
          setTimeout(resolve, 1000); // Wait for scroll to complete
        });
      }, scrollAmount);
  
      // Wait for any potential dynamic content to load
      await this.page.waitForTimeout(1000);
  
    } catch (error) {
      console.error('Error in scrollPage:', error);
      await this.handleError(error as Error);
    }
  }

  private generateBezierCurve(start: { x: number; y: number }, end: { x: number; y: number }): { x: number; y: number }[] {
    const points = [];
    const controlPoint1 = {
      x: start.x + (end.x - start.x) * (1/3 + (Math.random() - 0.5) * 0.1),
      y: start.y + (end.y - start.y) * (1/3 + (Math.random() - 0.5) * 0.1),
    };
    const controlPoint2 = {
      x: start.x + (end.x - start.x) * (2/3 + (Math.random() - 0.5) * 0.1),
      y: start.y + (end.y - start.y) * (2/3 + (Math.random() - 0.5) * 0.1),
    };
   
    for (let t = 0; t <= 1; t += 0.05) {
      points.push(this.bezierPoint(start, controlPoint1, controlPoint2, end, t));
    }
    return points;
  }

  private bezierPoint(p0: { x: number; y: number }, p1: { x: number; y: number }, p2: { x: number; y: number }, p3: { x: number; y: number }, t: number): { x: number; y: number } {
    const cX = 3 * (p1.x - p0.x),
          bX = 3 * (p2.x - p1.x) - cX,
          aX = p3.x - p0.x - cX - bX;
   
    const cY = 3 * (p1.y - p0.y),
          bY = 3 * (p2.y - p1.y) - cY,
          aY = p3.y - p0.y - cY - bY;
   
    const x = (aX * Math.pow(t, 3)) + (bX * Math.pow(t, 2)) + (cX * t) + p0.x;
    const y = (aY * Math.pow(t, 3)) + (bY * Math.pow(t, 2)) + (cY * t) + p0.y;
   
    return {x: Math.round(x), y: Math.round(y)};
  }

  private getRandomDuration(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  private async showCustomCursor(retries = 3) {
    if (!this.isPageValid()) {
      console.log('Page is not available for cursor creation');
      return;
    }
 
    try {
      await this.page.evaluate(() => {
        if (!document.querySelector('#custom-cursor')) {
          const cursor = document.createElement('div');
          cursor.id = 'custom-cursor';
          cursor.style.position = 'fixed';
          cursor.style.width = '24px';
          cursor.style.height = '24px';
          cursor.style.borderRadius = '50%';
          cursor.style.background = 'radial-gradient(circle, rgba(0,0,255,0.7) 0%, rgba(255,0,255,0.7) 100%)';
          cursor.style.border = '1px solid #1a0033';
          cursor.style.pointerEvents = 'none';
          cursor.style.zIndex = '9999999';
          cursor.style.boxShadow = '0 0 5px rgba(0,0,0,0.5)';
 
          const crosshair = document.createElement('div');
          crosshair.style.position = 'absolute';
          crosshair.style.top = '50%';
          crosshair.style.left = '50%';
          crosshair.style.width = '120%';
          crosshair.style.height = '120%';
          crosshair.style.transform = 'translate(-50%, -50%)';
          crosshair.style.background = 'linear-gradient(to bottom right, #00f, #f0f)';
          crosshair.style.clipPath = 'polygon(50% 0%, 50% 40%, 60% 40%, 60% 60%, 50% 60%, 50% 100%, 40% 100%, 40% 60%, 0% 60%, 0% 40%, 40% 40%, 40% 0%)';
         
          cursor.appendChild(crosshair);
          document.body.appendChild(cursor);
        }
      });
      console.log('Enhanced custom cursor created successfully');
    } catch (error) {
      console.error('Error creating custom cursor:', error);
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await this.showCustomCursor(retries - 1);
      }
    }
  }

  private async moveCustomCursor(x: number, y: number, maxRetries = 3) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      if (!this.isPageValid() || !this.isRunning) return;

      try {
        await this.page.evaluate(({ x, y }) => {
          const cursor = document.querySelector('#custom-cursor');
          if (cursor instanceof HTMLElement) {
            cursor.style.left = `${x}px`;
            cursor.style.top = `${y}px`;
          }
          (window as any).mouseX = x;
          (window as any).mouseY = y;
        }, { x, y });

        console.log(`Moved cursor to (${x}, ${y})`);
        return;
      } catch (error) {
        console.warn(`Attempt ${attempt + 1} to move cursor failed:`, error);
        if (attempt === maxRetries - 1) {
          console.error('Max retries reached. Falling back to native mouse movement.');
          await this.page.mouse.move(x, y);
          console.log(`Fallback: Moved cursor to (${x}, ${y})`);
        } else {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }
  }

  public async clickElement(selector: string) {
    if (!this.isPageValid()) return;
    try {
      await this.page.click(selector);
      console.log(`Clicked element: ${selector}`);
    } catch (error) {
      console.error(`Error clicking element ${selector}:`, error);
    }
  }

  public async hoverElement(selector: string) {
    if (!this.isPageValid()) return;
    try {
      await this.page.hover(selector);
      console.log(`Hovered over element: ${selector}`);
    } catch (error) {
      console.error(`Error hovering over element ${selector}:`, error);
    }
  }

  public async fillForm(selector: string, value: string) {
    if (!this.isPageValid()) return;
    try {
      await this.page.fill(selector, value);
      console.log(`Filled form field ${selector} with value: ${value}`);
    } catch (error) {
      console.error(`Error filling form field ${selector}:`, error);
    }
  }

  public async selectText(selector: string) {
    if (!this.isPageValid()) return;
    try {
      await this.page.evaluate((sel) => {
        const element = document.querySelector(sel);
        if (element) {
          const range = document.createRange();
          range.selectNodeContents(element);
          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      }, selector);
      console.log(`Selected text in element: ${selector}`);
    } catch (error) {
      console.error(`Error selecting text in element ${selector}:`, error);
    }
  }

  public async openNewTab(url: string) {
    try {
      const newPage = await this.context.newPage();
      await newPage.goto(url);
      console.log(`Opened new tab with URL: ${url}`);
      return newPage;
    } catch (error) {
      console.error(`Error opening new tab with URL ${url}:`, error);
    }
  }

  public async switchToTab(index: number) {
    try {
      const pages = this.context.pages();
      if (index >= 0 && index < pages.length) {
        this.page = pages[index];
        await this.page.bringToFront();
        console.log(`Switched to tab index: ${index}`);
      } else {
        console.error(`Invalid tab index: ${index}`);
      }
    } catch (error) {
      console.error(`Error switching to tab index ${index}:`, error);
    }
  }

  public async typeText(text: string) {
    if (!this.isPageValid()) return;
    try {
      await this.page.keyboard.type(text, { delay: 100 });
      console.log(`Typed text: ${text}`);
    } catch (error) {
      console.error(`Error typing text: ${text}`, error);
    }
  }

  public async interactWithDynamicContent(selector: string, action: 'click' | 'hover' | 'scroll') {
    if (!this.isPageValid()) return;
    try {
      await this.page.waitForSelector(selector, { state: 'visible' });
      switch (action) {
        case 'click':
          await this.clickElement(selector);
          break;
          case 'hover':
            await this.hoverElement(selector);
            break;
          case 'scroll':
            await this.page.evaluate((sel) => {
              const element = document.querySelector(sel);
              if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, selector);
            console.log(`Scrolled to element: ${selector}`);
            break;
        }
      } catch (error) {
        console.error(`Error interacting with dynamic content ${selector}:`, error);
      }
    }
  
    public async waitForNetworkIdle(timeout = 30000) {
      if (!this.isPageValid()) return;
      try {
        await this.page.waitForLoadState('networkidle', { timeout });
        console.log('Waited for network to be idle');
      } catch (error) {
        console.error('Error waiting for network idle:', error);
      }
    }
  
    private async handleError(error: Error) {
      console.error('AutomatedBrowsing encountered an error:', error);
      this.pause();
      await this.waitForStableNetwork(this.page);
      this.resume();
    }
  }
  
