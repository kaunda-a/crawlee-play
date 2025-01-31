import { NextResponse } from 'next/server';
import { ProxyConfiguration } from 'crawlee';
import { Browser, chromium } from 'playwright';
import { v4 as uuidv4 } from 'uuid';
import ConsoleVault from '@/lib/crawlers/ConsoleVault';
import { supabase } from '@/lib/database/client';
import { Page, BrowserContext } from 'playwright';

let browser: Browser | null = null;
let context: BrowserContext | null = null;
let page: Page | null = null;

// Add the same interface used in proxies route
interface Proxy {
    id: string;
    host: string;
    port: number;
    username: string;
    password: string;
    status: 'active' | 'inactive';
    success_rate: number;
    last_used: string;
}

export async function GET() {
    // Use the same query structure as proxies route
    const { data: proxies, error } = await supabase
        .from('proxies')
        .select('*');

    if (error) {
        return NextResponse.json({ error: 'Failed to fetch proxies' }, { status: 500 });
    }

    const { data: executions } = await supabase
        .from('executions')
        .select('status');

    return NextResponse.json({
        status: 'online',
        proxies,
        timestamp: new Date().toISOString()
    });
}

export async function POST(request: Request) {
    const executionId = uuidv4();
    let browser = null;
    let context = null;
    let page = null;
    let selectedProxy: Proxy | null = null;
    
    try {
        const { command } = await request.json();
  // Add diagnostic logging
    console.log('Fetching active proxies...');
        // Use the same query structure as proxies route
        const { data: proxy, error } = await supabase
            .from('proxies')
            .select('*')
            .eq('status', 'active')
            .order('success_rate', { ascending: false })
            .limit(1)
            .single();

            console.log('Proxy query result:', { proxy, error });
        if (error || !proxy) {
            throw new Error('No active proxies available');
        }

        selectedProxy = proxy;

        // Update proxy last used timestamp
        await supabase
            .from('proxies')
            .update({ last_used: new Date().toISOString() })
            .eq('id', proxy.id);

// Format the proxy URL correctly based on the protocol
const proxyUrl = `${proxy.protocol}://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`;

const proxyConfiguration = new ProxyConfiguration({
    proxyUrls: [proxyUrl]  // Pass as array with the formatted URL
});

// Create browser context with proxy settings
browser = await chromium.launch({
    headless: true
});

context = await browser.newContext({
    proxy: {
        server: proxyUrl,
        username: proxy.username,
        password: proxy.password
    }
});


const vault = new ConsoleVault(context, page, {
    geminiKey: process.env.GEMINI_API_KEY!,
    proxyEnabled: true,
    fingerprintEnabled: true,
    debugMode: true,
    stealthMode: true,
    maxRetries: 3,
    timeoutMs: 30000,
    proxyConfig: {
        enabled: true,
        interval: 300000,
        strategy: 'performance',
        minSuccessRate: 0.8
    }
});

        const result = await vault.processCommand(command);

        // Update success metrics
        await supabase.rpc('update_proxy_metrics', { 
            p_id: proxy.id, 
            success: true 
        });

        await supabase.from('executions').insert({
            id: executionId,
            command,
            result,
            proxy_id: proxy.id,
            status: 'completed',
            created_at: new Date().toISOString()
        });

        return NextResponse.json({
            success: true,
            executionId,
            result,
            proxy: {
                id: proxy.id,
                host: proxy.host
            }
        });

    } catch (err) {
        const error = err as Error;
        console.error('Execution error:', error);
        
        if (selectedProxy) {
            await supabase.rpc('update_proxy_metrics', { 
                p_id: selectedProxy.id, 
                success: false 
            });
        }

        await supabase.from('executions').insert({
            id: executionId,
            status: 'failed',
            error: error.message,
            proxy_id: selectedProxy?.id,
            created_at: new Date().toISOString()
        });

        return NextResponse.json({ 
            success: false,
            executionId,
            error: error.message
        }, { 
            status: 500 
        });

    } finally {
        if (page) await page.close();
        if (context) await context.close();
        if (browser) await browser.close();
    }
}
