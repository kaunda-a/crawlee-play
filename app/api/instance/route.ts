import { NextResponse } from 'next/server';
import { chromium } from 'playwright';
import { supabase } from '@/lib/database/client';

export async function POST(request: Request) {
  try {
    const { botId, proxyId } = await request.json();

    // Fetch bot configuration
    const { data: bot, error: botError } = await supabase
      .from('bots')
      .select('*')
      .eq('id', botId)
      .single();

    if (botError || !bot) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }

    // Fetch proxy configuration
    const { data: proxy, error: proxyError } = await supabase
      .from('proxies')
      .select('*')
      .eq('id', proxyId)
      .single();

    if (proxyError || !proxy) {
      return NextResponse.json({ error: 'Proxy not found' }, { status: 404 });
    }

    // Launch browser with anti-detection settings
    const browser = await chromium.launch({
      headless: false, // This makes the browser visible
      proxy: {
        server: `http://${proxy.host}:${proxy.port}`,
        username: proxy.username,
        password: proxy.password,
      },
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-features=IsolateOrigins,site-per-process',
      ],
    });

    const context = await browser.newContext({
      userAgent: bot.userAgent,
      viewport: {
        width: 1920,
        height: 1080,
      },
      deviceScaleFactor: 1,
      hasTouch: false,
      javaScriptEnabled: true,
      locale: 'en-US',
      timezoneId: 'America/New_York',
      permissions: ['geolocation'],
    });

    // Apply fingerprint evasion
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });
    });

    const page = await context.newPage();
    await page.goto('https://google.com'); // Or any other URL you want to test


    return NextResponse.json({ 
      message: 'Browser instance launched successfully',
      sessionId: context.browser()?.contexts()[0].pages()[0].url()
    });

  } catch (error) {
    console.error('Error launching browser:', error);
    return NextResponse.json({ 
      error: 'Failed to launch browser instance',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
