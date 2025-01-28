// lib/queue/bull.ts

import Queue from 'bull';
import { runPlaywrightCrawler } from '@/lib/crawlers/playwright';

export const initQueue = () => {
  const crawlQueue = new Queue('crawl', 'redis://127.0.0.1:6379');

  crawlQueue.process(async (job) => {
    const { url } = job.data;
    return await runPlaywrightCrawler(url);
  });

  return crawlQueue;
};
