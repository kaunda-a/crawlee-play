import { runPlaywrightCrawler } from '@/lib/crawlers/playwright';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { message: 'URL is required' },
        { status: 400 }
      );
    }

    const result = await runPlaywrightCrawler(url);
    
    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Crawl error:', error);
    
    return NextResponse.json(
      { message: 'Failed to process crawl request' },
      { status: 500 }
    );
  }
}
