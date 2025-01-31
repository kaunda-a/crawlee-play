import { NextResponse } from 'next/server';
import { supabase } from '@/lib/database/client';


export async function GET() {
  try {
    // Fetch all bots from the "bots" table
    const { data: bots, error } = await supabase
      .from('bots')
      .select('*');

    if (error) {
      throw error;
    }

    return NextResponse.json(bots);
  } catch (error) {
    console.error('Error fetching bots:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: 'Failed to fetch bots', details: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'Failed to fetch bots', details: 'Unknown error' }, { status: 500 });
    }
  }
}

export async function POST(request: Request) {
  try {
    const bot = await request.json();

    // Validate required fields
    if (!bot.name || !bot.browser || !bot.device) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Insert a new bot into the "bots" table
    const { data, error } = await supabase
      .from('bots')
      .insert([bot])
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json({ message: 'Bot created successfully', data }, { status: 201 });
  } catch (error) {
    console.error('Error creating bot:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: 'Failed to create bot', details: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'Failed to create bot', details: 'Unknown error' }, { status: 500 });
    }
  }
}