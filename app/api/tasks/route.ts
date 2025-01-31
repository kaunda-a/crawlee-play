import { NextResponse } from 'next/server';
import { supabase } from '@/lib/database/client';
import { TaskManager } from '@/lib/TaskManager';
import { ProxyRotator } from '@/lib/ProxyRotator';
import { BehaviorSimulator } from '@/lib/BehaviorSimulator';
import { CaptchaSolver } from '@/lib/CaptchaSolver';
import { FingerprintManager } from '@/lib/FingerprintManager';
import { Browser, BrowserContext } from 'playwright';

// Initialize dependencies
const proxyRotator = new ProxyRotator([]);
const behaviorSimulator = new BehaviorSimulator({} as any, {} as Browser, {} as BrowserContext);
const captchaSolver = new CaptchaSolver(process.env.CAPTCHA_SOLVER_API_KEY || '', {} as any);
const fingerprintManager = new FingerprintManager();

const taskManager = new TaskManager(
  proxyRotator,
  behaviorSimulator,
  captchaSolver,
  fingerprintManager,
);

export async function GET() {
  try {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      tasks,
      message: 'Successfully fetched tasks'
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({
      error: 'Failed to fetch data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const text = await request.text();
    const lines = text.split('\n');
    const [type, parameters, url, googleSearchQuery, googleSearchTarget, actionsString] = lines;

    if (!type || !parameters) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let actions = [];
    try {
      actions = actionsString ? JSON.parse(actionsString) : [];
    } catch (error) {
      console.error('Error parsing actions:', error);
    }

    const taskDocument = {
      type,
      parameters: JSON.parse(parameters),
      url: url || '',
      google_search_query: googleSearchQuery || '',
      google_search_target: googleSearchTarget || '',
      actions,
      status: 'Active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert([taskDocument])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      message: 'Task created successfully',
      task: data
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({
      error: 'Failed to create task',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...updatedTask } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    await taskManager.updateTask(id, updatedTask);

    const { error } = await supabase
      .from('tasks')
      .update({ 
        ...updatedTask,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Task updated successfully' });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to update task',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    await taskManager.deleteTask(id);

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to delete task',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
