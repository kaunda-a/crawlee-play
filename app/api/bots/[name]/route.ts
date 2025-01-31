import { NextResponse } from 'next/server';
import { supabase } from '@/lib/database/client';

export async function GET(request: Request, { params }: { params: { name: string } }) {
  try {
    // Fetch a bot by name from the "bots" table
    const { data: bot, error } = await supabase
      .from('bots')
      .select('*')
      .eq('name', params.name)
      .single();

    if (error) {
      throw error;
    }

    if (!bot) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }

    return NextResponse.json(bot);
  } catch (error) {
    console.error('Error fetching bot:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: 'Failed to fetch bot', details: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'Failed to fetch bot', details: 'Unknown error' }, { status: 500 });
    }
  }
}

export async function PUT(request: Request, { params }: { params: { name: string } }) {
  try {
    const updatedBot = await request.json();

    // Validate required fields
    if (!updatedBot.name || !updatedBot.browser || !updatedBot.device) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Update the bot in the "bots" table
    const { data, error } = await supabase
      .from('bots')
      .update(updatedBot)
      .eq('name', params.name)
      .select();

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Bot updated successfully', data });
  } catch (error) {
    console.error('Error updating bot:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: 'Failed to update bot', details: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'Failed to update bot', details: 'Unknown error' }, { status: 500 });
    }
  }
}

export async function DELETE(request: Request, { params }: { params: { name: string } }) {
  try {
    // Delete a bot by name from the "bots" table
    const { data, error } = await supabase
      .from('bots')
      .delete()
      .eq('name', params.name)
      .select();

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Bot deleted successfully' });
  } catch (error) {
    console.error('Error deleting bot:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: 'Failed to delete bot', details: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'Failed to delete bot', details: 'Unknown error' }, { status: 500 });
    }
  }
}