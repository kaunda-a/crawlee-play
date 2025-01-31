import { Page, BrowserContext } from 'playwright';

export class HeadlessModeEvasion {
  async applyEvasionTechniques(context: BrowserContext) {
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
    });
  }
}
