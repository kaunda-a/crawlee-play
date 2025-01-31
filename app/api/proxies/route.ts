
// app/api/proxies/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/database/client';

export async function GET() {
  try {
    const { data: proxies, error } = await supabase
      .from('proxies')
      .select('*');

    if (error) {
      throw error;
    }

    return NextResponse.json(proxies);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch proxies' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const proxy = await request.json();

    const { data, error } = await supabase
      .from('proxies')
      .insert([proxy])
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json({ message: 'Proxy created successfully', id: data[0].id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create proxy' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...updatedProxy } = await request.json();

    const { data, error } = await supabase
      .from('proxies')
      .update(updatedProxy)
      .eq('id', id)
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json({ message: 'Proxy updated successfully', data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update proxy' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Proxy ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('proxies')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ message: 'Proxy deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete proxy' }, { status: 500 });
  }
}

