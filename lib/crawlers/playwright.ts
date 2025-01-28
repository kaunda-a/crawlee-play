import { chromium } from 'playwright';
import { supabase } from '../database/client';

export async function runPlaywrightCrawler(url: string) {
  const browser = await chromium.launch({
    headless: false, // Set to `true` for headless mode in production
    devtools: true,  // Enable DevTools for debugging
    args: [
      '--no-sandbox',
      '--start-maximized',
      '--window-position=0,0',
      '--window-size=1280,720'
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });

  const page = await context.newPage();
  console.log('🚀 Browser launched! Watch the crawling in action.');

  try {
    // Navigate to the URL with a longer timeout
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Wait for the page to load or timeout gracefully
    try {
      await page.waitForLoadState('networkidle', { timeout: 10000 });
    } catch (error) {
      console.warn('Page did not reach networkidle state within the timeout:', error);
    }

    // Extract page title and content
    const title = await page.title();
    const content = await page.content();

    // Save results to Supabase
    const { data, error } = await supabase
      .from('crawl_results')
      .insert([{ url, title, content }]);

    if (error) {
      throw new Error(`Supabase insert error: ${error.message}`);
    }

    console.log('✅ Crawl results saved to Supabase:', data);

    // Keep browser open for observation (optional)
    await new Promise(resolve => setTimeout(resolve, 5000));

    return { title, content };
  } catch (error) {
    console.error('❌ Crawl error:', error);
    throw error; // Re-throw the error for further handling
  } finally {
    // Ensure the browser is always closed
    await browser.close();
    console.log('🚪 Browser closed.');
  }
}