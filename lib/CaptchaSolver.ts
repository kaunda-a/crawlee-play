import { Solver } from '2captcha-ts';
import { Page } from 'playwright';

export class CaptchaSolver {
  private apiKey: string;
  private page: Page;

  constructor(apiKey: string, page: Page) {
    this.apiKey = apiKey;
    this.page = page;
  }

  async solveCaptcha(siteKey: string, url: string): Promise<string> {
    try {
      const captchaFrame = await this.page.frameLocator('iframe[src^="https://www.google.com/recaptcha/api2/anchor"]');
      const captchaElement = await captchaFrame.locator('#recaptcha-anchor').first();

      if (!captchaElement) {
        console.warn('Captcha element not found on the page');
      }

      const solver = new Solver(this.apiKey);
      const result = await solver.recaptcha({
        googlekey: siteKey,
        pageurl: url,
        invisible: await this.isInvisibleCaptcha(),
        enterprise: await this.isEnterpriseCaptcha() ? 1 : 0,
      });

      await this.injectCaptchaSolution(result.data);

      return result.data;
    } catch (error: unknown) {
      console.error('Failed to solve CAPTCHA:', error);
      if (error instanceof Error) {
        throw new Error(`Captcha solving failed: ${error.message}`);
      } else {
        throw new Error('Captcha solving failed: Unknown error');
      }
    }
  }

  private async isInvisibleCaptcha(): Promise<boolean> {
    return await this.page.evaluate(() => {
      const script = document.querySelector('script[src*="google.com/recaptcha/api.js"]');
      return script ? script.getAttribute('src')?.includes('size=invisible') ?? false : false;
    });
  }

  private async isEnterpriseCaptcha(): Promise<boolean> {
    return await this.page.evaluate(() => {
      const script = document.querySelector('script[src*="google.com/recaptcha/enterprise.js"]');
      return !!script;
    });
  }

  private async injectCaptchaSolution(solution: string): Promise<void> {
    await this.page.evaluate((sol) => {
      (window as any).grecaptcha.enterprise ? 
        (window as any).grecaptcha.enterprise.execute(sol) :
        (window as any).grecaptcha.execute(sol);
    }, solution);
  }

  async waitForCaptchaResponse(): Promise<void> {
    await this.page.waitForResponse(response => 
      response.url().includes('recaptcha') && response.status() === 200
    );
  }

  async bypassCaptcha(): Promise<void> {
    const url = this.page.url();
    const siteKey = await this.extractSiteKey();
    const solution = await this.solveCaptcha(siteKey, url);
    await this.injectCaptchaSolution(solution);
    await this.waitForCaptchaResponse();
  }

  private async extractSiteKey(): Promise<string> {
    const siteKey = await this.page.evaluate(() => {
      const element = document.querySelector('.g-recaptcha');
      return element ? element.getAttribute('data-sitekey') : null;
    });
    if (siteKey === null) {
      throw new Error('Failed to extract site key');
    }
    return siteKey;
  }

  async detectCaptcha(page: Page): Promise<boolean> {
    const captchaFrame = await page.frameLocator('iframe[src^="https://www.google.com/recaptcha/api2/anchor"]');
    const captchaElement = await captchaFrame.locator('#recaptcha-anchor').first();
    return captchaElement !== null;
  }
}
