// lib/NetworkObfuscator.ts
export class NetworkObfuscator {
    async simulateHumanNetworkBehavior(page: import('playwright').Page) {
      await page.route('**/*', async (route: any) => {
        await this.addRandomDelay();
        await route.continue();
      });
    }
  
    private async addRandomDelay() {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
    }
  }
  