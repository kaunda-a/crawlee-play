import { Action } from '@/types/Action';
import { BaseTask } from './BaseTask';
import { Browser, BrowserContext, Page } from 'playwright';
import ProxyRotator from './ProxyRotator';
import { BehaviorSimulator } from './BehaviorSimulator';
import { CaptchaSolver } from './CaptchaSolver';
import { FingerprintManager } from './FingerprintManager';
import { TaskManager } from './TaskManager';

export class GoogleSearch extends BaseTask {
  constructor(
    type: string,
    parameters: any,
    actions: Action[],
    proxyRotator: ProxyRotator,
    behaviorSimulator: BehaviorSimulator,
    captchaSolver: CaptchaSolver,
    fingerprintManager: FingerprintManager,
    private taskManager: TaskManager
  ) {
    super(type, parameters, actions, proxyRotator, behaviorSimulator, captchaSolver, fingerprintManager);
  }

  async execute(browser: Browser, context: BrowserContext, page: Page) {
    try {
      console.log('Navigating to Google homepage');
      await page.goto('https://www.google.com', { waitUntil: 'networkidle', timeout: 60000 });

      console.log(`Typing search query: ${this.parameters.searchQuery}`);
      await page.waitForSelector('input[name="q"]', { state: 'visible', timeout: 30000 });
      await page.click('input[name="q"]');
      await page.keyboard.type(this.parameters.searchQuery, { delay: 100 });

      console.log('Pressing Enter to search');
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'load', timeout: 60000 }),
        page.keyboard.press('Enter')
      ]);

      console.log('Waiting for search results');
      await page.waitForSelector('#search', { state: 'visible', timeout: 30000 });

      const targetUrl = this.parameters.googleSearchTarget;
      const linkSelector = `a[href*="${targetUrl}"]`;
      console.log(`Looking for target link: ${linkSelector}`);

      await page.waitForSelector(linkSelector, { state: 'visible', timeout: 30000 }).catch(() => null);

      const targetElement = await page.$(linkSelector);
      if (targetElement) {
        console.log('Target link found, clicking');
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'load', timeout: 60000 }),
          targetElement.click()
        ]);
        console.log('Navigated to target page');
      } else {
        console.log('Target link not found, navigating directly');
        await page.goto(targetUrl, { waitUntil: 'load', timeout: 60000 });
      }

      // Ensure we're on the target page
      if (!page.url().includes(targetUrl)) {
        console.log('Navigation to target page failed, retrying...');
        await page.goto(targetUrl, { waitUntil: 'load', timeout: 60000 });
      }

      console.log('Collecting final state');
      const finalState = await page.evaluate(() => ({
        url: window.location.href,
        title: document.title,
        content: document.body.innerText
      }));

      console.log('GoogleSearchTask completed successfully');
      return { status: 'completed', data: finalState };
    } catch (error: unknown) {
      console.error('Error executing GoogleSearchTask:', error);
      if (error instanceof Error) {
        console.error('Error stack:', error.stack);
      }
      throw error;
    }
  }
}
