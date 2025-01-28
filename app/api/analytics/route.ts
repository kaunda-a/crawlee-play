import { supabase } from '@/lib/database/client';
import { NextResponse } from 'next/server';

export const runtime = 'edge'

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
