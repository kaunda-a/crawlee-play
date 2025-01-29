import { supabase } from '@/lib/database/client';
import { NextResponse } from 'next/server';

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const { url } = await req.json()
  
  // Simplified crawler logic for Edge
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
    }
  })
  
  const content = await response.text()
  
  return NextResponse.json({ 
    success: true, 
    data: { url, content } 
  })
}



export async function GET() {
  const { data, error } = await supabase
    .from('crawl_results')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
