import { NextResponse } from 'next/server';

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { message: 'URL is required' },
        { status: 400 }
      );
    }

    // Edge-optimized crawler logic
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
      }
    });
    
    const content = await response.text();
    
    return NextResponse.json({
      success: true,
      data: { url, content }
    });

  } catch (error) {
    console.error('Crawl error:', error);
    
    return NextResponse.json(
      { message: 'Failed to process crawl request' },
      { status: 500 }
    );
  }
}
