// lib/CacheManager.ts
import { BrowserContext } from 'playwright';
import { readFileSync, writeFileSync, existsSync } from 'fs';

export class CacheManager {
  private cacheFile: string;

  constructor(cacheFile: string) {
    this.cacheFile = cacheFile;
  }

  async loadCacheAndCookies(context: BrowserContext) {
    if (existsSync(this.cacheFile)) {
      let data;
      try {
        const fileContent = readFileSync(this.cacheFile, 'utf-8');
        data = fileContent ? JSON.parse(fileContent) : { cookies: [], cache: {} }; // Handle empty file
      } catch (error) {
        console.error('Error parsing cache file:', error);
        return; // Exit if parsing fails
      }

      await context.addCookies(data.cookies || []); // Ensure cookies is an array

      // Restore cache
      if (data.cache) {
        await context.addInitScript((cacheData) => {
          if (window.caches) {
            Object.keys(cacheData).forEach(async (cacheName) => {
              const cache = await window.caches.open(cacheName);
              cacheData[cacheName].forEach(async (entry: any) => {
                await cache.put(new Request(entry.url), new Response(entry.data, entry.options));
              });
            });
          }
        }, data.cache);
      }
    }
  }

  async saveCacheAndCookies(context: BrowserContext) {
    const cookies = await context.cookies();

    // Save cache
    const cache = await context.pages()[0].evaluate(async () => {
      if (!window.caches) return null;

      const cacheNames = await window.caches.keys();
      const cacheData: Record<string, any[]> = {};

      for (const cacheName of cacheNames) {
        const cache = await window.caches.open(cacheName);
        const requests = await cache.keys();
        cacheData[cacheName] = await Promise.all(
          requests.map(async (request) => {
            const response = await cache.match(request);
            return {
              url: request.url,
              data: await response?.text(),
              options: {
                status: response?.status,
                statusText: response?.statusText,
                headers: Object.fromEntries(response?.headers || []),
              },
            };
          })
        );
      }

      return cacheData;
    });

    const data = { cookies, cache };
    writeFileSync(this.cacheFile, JSON.stringify(data));
  }
}