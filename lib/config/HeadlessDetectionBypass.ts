import { BrowserContext } from 'playwright';

export class HeadlessDetectionBypass {
  async applyBypass(context: BrowserContext) {
    await context.addInitScript(() => {
      // Override navigator properties
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
      Object.defineProperty(navigator, 'permissions', {
        get: () => ({
          query: (parameters: any) => Promise.resolve({ state: 'granted' }),
        }),
      });
    });

    // Add random delays to mimic human behavior
    await context.addInitScript(() => {
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        await this.randomDelay();
        return originalFetch(...args);
      };
    });
  }

  private async randomDelay() {
    const delay = Math.random() * 200 + 100; // Random delay between 100ms and 300ms
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}