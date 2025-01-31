import { BrowserContext, BrowserType, Page } from 'playwright';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { UAParser } from 'ua-parser-js';
import { TimeZones, Languages, Platforms } from './constants';
import { PlaywrightCrawler, ProxyConfiguration, Request, CrawlingContext, Dictionary, Session } from 'crawlee';
import { supabase } from '../database/client';
// Comprehensive interfaces
interface VaultNode {
  id: string;
  type: 'start' | 'search' | 'click' | 'input' | 'scroll' | 'wait' | 'end';
  params: Record<string, any>;
  next: string | null;
  metadata?: {
    timing: number;
    success_rate: number;
    detection_risk: number;
    execution_count: number;
    last_execution: Date;
  };
}

interface CapturedAction {
  id: string;
  type: string;
  selector: string;
  value?: string;
  position?: { x: number, y: number };
  timestamp: number;
  metadata?: {
    viewport: { width: number; height: number };
    userAgent: string;
    platform: string;
    performance: {
      executionTime: number;
      memoryUsage: number;
    };
  };
}

interface StealthProfile {
  id: string;
  userAgent: string;
  viewport: { width: number; height: number };
  platform: string;
  plugins: string[];
  timezone: string;
  language: string[];
  webGL: {
    vendor: string;
    renderer: string;
  };
  battery: {
    level: number;
    charging: boolean;
  };
  hardware: {
    deviceMemory: number;
    hardwareConcurrency: number;
  };
}
    // Add these interfaces to your existing interfaces
    interface Proxy {
      id: string;
      host: string;
      port: number;
      username?: string;
      password?: string;
      protocol: 'http' | 'https' | 'socks4' | 'socks5';
      status: 'active' | 'inactive';
      lastUsed?: Date;
      successRate: number;
      responseTime: number;
    }
    
    interface ProxyRotationConfig {
      enabled: boolean;
      interval: number;
      strategy: 'round-robin' | 'random' | 'performance';
      minSuccessRate: number;
    }

interface PerformanceMetrics {
    jsHeapSize: number;
    totalJSHeapSize: number;
    timeOrigin: number;
    navigationTiming: PerformanceNavigationTiming;
    resourceTiming: PerformanceResourceTiming[];
    fps: number;
}

interface MonitoringData {
    timestamp: number;
    metrics: PerformanceMetrics;
    memory: NodeJS.MemoryUsage;
    cpu: NodeJS.CpuUsage;
}


interface ConsoleVaultConfig {
    geminiKey: string;
    proxyEnabled: boolean;
    fingerprintEnabled: boolean;
    debugMode: boolean;
    stealthMode: boolean;
    maxRetries: number;
    timeoutMs: number;
    proxy: {
        protocol: string;
        host: string;
        port: number;
        username: string;
        password: string;
    };
    launchContext: {
        launcher: BrowserType<{}>;
        launchOptions: {
            headless: boolean;
        };
    };
}

// Add at the top of the file
declare global {
    interface Performance {
        memory?: {
            usedJSHeapSize: number;
            totalJSHeapSize: number;
            jsHeapSizeLimit: number;
        };
    }
}

// Add to your global declarations
declare global {
    interface Window {
        _lastFPS: number;
    }
}

// Add at the top of the file
declare global {
    interface Window {
        captureAction: (action: Partial<CapturedAction>) => void;
    }
}

class ConsoleVault extends EventEmitter {
  processCommand(command: any) {
    throw new Error('Method not implemented.');
  }
  private crawler: PlaywrightCrawler;
  private proxyConfiguration: ProxyConfiguration;
  private context: BrowserContext;
  private page: Page;
  private gemini: GoogleGenerativeAI;
  private vaultNodes: Map<string, VaultNode>;
  private capturedActions: CapturedAction[];
  private fingerprints: Map<string, StealthProfile>;
  private debugMode: boolean;
  private stealthMode: boolean;
  private executionHistory: Map<string, any[]>;
  private performanceMetrics: Map<string, any>;

  constructor(
      context: BrowserContext,
      page: Page,
      config: {
          proxy: any;
          geminiKey: string;
          proxyEnabled: boolean;
          fingerprintEnabled: boolean;
          debugMode: boolean;
          stealthMode: boolean;
          maxRetries: number;
          timeoutMs: number;
          proxyConfig?: ProxyRotationConfig;
      }
  ) {
      super();
      this.context = context;
      this.page = page;
      this.gemini = new GoogleGenerativeAI(config.geminiKey);
      this.vaultNodes = new Map();
      this.capturedActions = [];
      this.fingerprints = this.initializeFingerprints();
      this.debugMode = config.debugMode;
      this.stealthMode = config.stealthMode;
      this.executionHistory = new Map();
      this.performanceMetrics = new Map();
      

      const proxyUrl = `${config.proxy.protocol}://${config.proxy.username}:${config.proxy.password}@${config.proxy.host}:${config.proxy.port}`;
    
      this.proxyConfiguration = new ProxyConfiguration({
          proxyUrls: [proxyUrl]
      });

      // Initialize Crawlee crawler
      this.crawler = new PlaywrightCrawler({
          proxyConfiguration: this.proxyConfiguration,
          maxRequestRetries: config.maxRetries,
          requestHandlerTimeoutSecs: config.timeoutMs / 1000,
          browserPoolOptions: {
              useFingerprints: config.fingerprintEnabled,
              fingerprintOptions: {
                  fingerprintGeneratorOptions: {
                      browsers: ['chrome', 'firefox', 'safari'],
                      devices: ['desktop', 'mobile'],
                      operatingSystems: ['windows', 'macos', 'linux']
                  }
              }
          },
 // Update the preNavigationHooks type
preNavigationHooks: [
  async (crawlingContext: CrawlingContext<Dictionary>) => {
      const page = crawlingContext.page as Page;
      if (this.stealthMode) {
          await this.applyStealthMode(page);
      }
  }
],
          requestHandler: async ({ request, page, session }) => {
              await this.handleRequest(request, page, session);
          }
      });

      this.initializeVault();
  }

 
  
  // Update the method signature
  private async getNextProxyUrl(session: Session): Promise<string> {
      const { data: proxy } = await supabase
          .from('proxies')
          .select('*')
          .eq('status', 'active')
          .order('last_used', { ascending: true })
          .limit(1)
          .single();
  
      if (proxy) {
          await supabase
              .from('proxies')
              .update({ 
                  last_used: new Date().toISOString(),
                  current_session: session.id 
              })
              .eq('id', proxy.id);
  
          return `http://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`;
      }
  
      throw new Error('No available proxies found');
  }
  

  private async handleRequest(request: Request, page: Page, session: any) {
      try {
          // Implement request handling logic
          await page.goto(request.url);
          // Add your custom logic here
      } catch (error) {
          console.error('Request failed:', error);
          session.markBad();
          throw error;
      }
  }


  private async applyStealthMode(page: Page) {
      await page.addInitScript(() => {
          // Add your stealth mode implementation
          Object.defineProperty(navigator, 'webdriver', { get: () => false });
      });
  }
private parseGeminiResponse(response: string): VaultNode[] {
  try {
      const parsed = JSON.parse(response);
      return this.validateAndTransformNodes(parsed);
  } catch (e) {
      const error = e as Error;
      throw new Error(`Failed to parse Gemini response: ${error.message}`);
  }
}


//

  private async initializeVault() {
    await this.setupEventListeners();
    if (this.stealthMode) {
      await this.initializeStealthMode();
    }
    if (this.debugMode) {
      this.initializeDebugMode();
    }
  }
  private initializeDebugMode(): void {
    // Node execution monitoring
    this.on('nodeExecution', (data: {
        nodeId: string;
        type: string;
        status: string;
        duration: number;
    }) => {
        console.log('[Debug] Node Execution:', {
            ...data,
            timestamp: new Date().toISOString(),
            memory: process.memoryUsage(),
            heap: process.memoryUsage().heapUsed / 1024 / 1024
        });
    });

    // Performance monitoring
    this.on('performanceUpdate', (data: {
        nodeId: string;
        performance: any;
    }) => {
        console.log('[Debug] Performance:', {
            nodeId: data.nodeId,
            metrics: data.performance,
            timestamp: Date.now()
        });
    });

    // Page console monitoring
    this.page.on('console', msg => {
        const type = msg.type();
        console.log(`[Debug] Console ${type}:`, msg.text());
    });

    // Network request monitoring
    this.page.on('request', request => {
        console.log('[Debug] Request:', {
            url: request.url(),
            method: request.method(),
            headers: request.headers(),
            timestamp: Date.now()
        });
    });

    // Error tracking
    this.on('error', (error: Error) => {
        console.error('[Debug] Error:', {
            name: error.name,
            message: error.message,
            stack: error.stack,
            timestamp: Date.now()
        });
    });
}


  private initializeFingerprints(): Map<string, StealthProfile> {
    const fingerprints = new Map();
    // Generate diverse fingerprint profiles
    for (let i = 0; i < 10; i++) {
      const profile = this.generateStealthProfile();
      fingerprints.set(profile.id, profile);
    }
    return fingerprints;
  }

  private generateStealthProfile(): StealthProfile {
    const parser = new (UAParser as any)();
    const randomUA = this.getRandomUserAgent();
    parser.setUA(randomUA);

    return {
      id: uuidv4(),
      userAgent: randomUA,
      viewport: this.getRandomViewport(),
      platform: this.getRandomPlatform(),
      plugins: this.generateFakePlugins(),
      timezone: this.getRandomTimezone(),
      language: this.getRandomLanguages(),
      webGL: this.generateWebGLData(),
      battery: this.generateBatteryData(),
      hardware: this.generateHardwareData()
    };
  }
  private getRandomViewport(): { width: number; height: number } {
    const viewports = [
        { width: 1920, height: 1080 },
        { width: 1366, height: 768 },
        { width: 1440, height: 900 },
        { width: 2560, height: 1440 }
    ];
    return viewports[Math.floor(Math.random() * viewports.length)];
}

    private getRandomUserAgent(): string {
        const userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/89.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15'
        ];
        return userAgents[Math.floor(Math.random() * userAgents.length)];
    }
    
  generateFakePlugins(): string[] {
    const { CommonPlugins } = require('./constants');
    const numPlugins = Math.floor(Math.random() * 5) + 2; // Generate 2-6 plugins
    return CommonPlugins
        .sort(() => Math.random() - 0.5)
        .slice(0, numPlugins)
        .map((plugin: any) => plugin);
}

getRandomTimezone(): string {
    return TimeZones[Math.floor(Math.random() * TimeZones.length)];
}

    getRandomLanguages(): string[] {
        const numLanguages = Math.floor(Math.random() * 3) + 1;
        return Languages
            .sort(() => Math.random() - 0.5)
            .slice(0, numLanguages)
            .map(lang => lang[0]);
    }
    
    generateWebGLData(): { vendor: string; renderer: string; } {
        const { WebGLVendors, WebGLRenderers } = require('./constants');
        return {
            vendor: WebGLVendors[Math.floor(Math.random() * WebGLVendors.length)],
            renderer: WebGLRenderers[Math.floor(Math.random() * WebGLRenderers.length)]
        };
    }
    
    generateBatteryData(): { level: number; charging: boolean; } {
        const { BatteryLevels } = require('./constants');
        return {
            level: Number((Math.random() * (BatteryLevels.max - BatteryLevels.min) + BatteryLevels.min).toFixed(2)),
            charging: Math.random() > 0.5
        };
    }
    
    generateHardwareData(): { deviceMemory: number; hardwareConcurrency: number; } {
        const { DeviceMemoryOptions, HardwareConcurrencyOptions } = require('./constants');
        return {
            deviceMemory: DeviceMemoryOptions[Math.floor(Math.random() * DeviceMemoryOptions.length)],
            hardwareConcurrency: HardwareConcurrencyOptions[Math.floor(Math.random() * HardwareConcurrencyOptions.length)]
        };
    }
    
    getRandomPlatform(): string {
        return Platforms[Math.floor(Math.random() * Platforms.length)];
    }
    

      private buildEnhancedPrompt(command: string): string {
        return `
            Task Analysis Request:
            Command: ${command}
            Required:
            - Break down into atomic actions
            - Include timing considerations
            - Specify selectors and interactions
            - Consider anti-detection measures
            Output Format: JSON
        `;
    }
    
    private async createFlow(flowData: VaultNode[]): Promise<string> {
        const flowId = uuidv4();
        
        flowData.forEach(node => {
            this.vaultNodes.set(node.id, {
                ...node,
                metadata: {
                    timing: this.calculateOptimalTiming(node),
                    success_rate: 1.0, // Initialize with perfect success rate
                    detection_risk: this.assessDetectionRisk(node),
                    execution_count: 0,
                    last_execution: new Date()
                }
            });
        });
    
        this.executionHistory.set(flowId, []);
        
        const flowMetadata = {
            id: flowId,
            created: new Date(),
            nodeCount: flowData.length,
            startNode: flowData[0].id,
            endNode: flowData[flowData.length - 1].id,
            status: 'initialized'
        };
    
        this.emit('flowCreated', flowMetadata);
    
        return flowId;
    }
       

    
      // Flow Control Implementation
      private validateAndTransformNodes(nodes: any[]): VaultNode[] {
        return nodes.map((node, index) => ({
          id: uuidv4(),
          type: node.type,
          params: node.params,
          next: index < nodes.length - 1 ? nodes[index + 1].id : null,
          metadata: {
            timing: this.calculateOptimalTiming(node),
            success_rate: 1.0,
            detection_risk: this.assessDetectionRisk(node),
            execution_count: 0,
            last_execution: new Date()
          }
        }));
      }
      calculateOptimalTiming(node: VaultNode): number {
        const baseTimings = {
            click: { min: 800, max: 2000 },
            input: { min: 1000, max: 3000 },
            scroll: { min: 500, max: 1500 },
            wait: { min: 2000, max: 5000 },
            search: { min: 1500, max: 4000 },
            start: { min: 0, max: 500 },
            end: { min: 0, max: 500 }
        };
    
        const timing = baseTimings[node.type];
        const randomDelay = Math.floor(Math.random() * (timing.max - timing.min) + timing.min);
        const humanVariation = Math.floor(Math.random() * 200); // Add human-like variation
    
        return randomDelay + humanVariation;
    }
    
    assessDetectionRisk(node: VaultNode): number {
        const riskFactors = {
            click: 0.3,
            input: 0.4,
            scroll: 0.2,
            wait: 0.1,
            search: 0.5,
            start: 0.1,
            end: 0.1
        };
    
        const baseRisk = riskFactors[node.type];
        const complexityFactor = this.calculateComplexityFactor(node);
        const patternRisk = this.calculatePatternRisk();
    
        return Math.min(1, baseRisk * complexityFactor * patternRisk);
    }
    
    private calculateComplexityFactor(node: VaultNode): number {
        const hasSelector = node.params?.selector ? 1.2 : 1;
        const hasValue = node.params?.value ? 1.3 : 1;
        const hasPosition = node.params?.position ? 1.1 : 1;
        
        return hasSelector * hasValue * hasPosition;
    }
    
    private calculatePatternRisk(): number {
        const hourOfDay = new Date().getHours();
        const isBusinessHours = hourOfDay >= 9 && hourOfDay <= 17;
        const dayOfWeek = new Date().getDay();
        const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
    
        return isBusinessHours && isWeekday ? 0.8 : 1.2;
    }
    
    
      // Recording System
      private async setupEventListeners() {
        await this.page.exposeFunction('captureAction', (action: CapturedAction) => {
          this.processAction(action);
        });
    
        await this.page.evaluate(() => {
          document.addEventListener('click', (e) => {
            window.captureAction({
              type: 'click',
              position: { x: e.clientX, y: e.clientY },
              timestamp: Date.now()
            });
          }, true);

        
          document.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            window.captureAction({
              type: 'input',
              value: target.value,
              timestamp: Date.now()
            });
          }, true);
        });
      }
      processAction(action: CapturedAction) {
        // Add unique identifier and timestamp if not present
        const enrichedAction = {
            ...action,
            id: action.id || uuidv4(),
            timestamp: action.timestamp || Date.now()
        };
    
        // Enrich with metadata
        enrichedAction.metadata = {
            ...enrichedAction.metadata,
            viewport: this.getRandomViewport(),
            userAgent: this.getRandomUserAgent(),
            platform: this.getRandomPlatform(),
            performance: {
                executionTime: performance.now(),
                memoryUsage: process.memoryUsage().heapUsed
            }
        };
    
        // Store the action
        this.capturedActions.push(enrichedAction);
    
        // Emit event for monitoring
        this.emit('actionCaptured', enrichedAction);
    
        // Update performance metrics
        this.monitorPerformance(enrichedAction.id);
    
        // Return the processed action
        return enrichedAction;
    }

    
    private async monitorPerformance(nodeId: string): Promise<void> {
        const metrics = await this.page.evaluate((): PerformanceMetrics => ({
            jsHeapSize: performance.memory?.usedJSHeapSize || 0,
            totalJSHeapSize: performance.memory?.totalJSHeapSize || 0,
            timeOrigin: performance.timeOrigin,
            navigationTiming: performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming,
            resourceTiming: performance.getEntriesByType('resource') as PerformanceResourceTiming[],
            fps: this.calculateFPS()
        }));
    
        const monitoringData: MonitoringData = {
            timestamp: Date.now(),
            metrics,
            memory: process.memoryUsage(),
            cpu: process.cpuUsage()
        };
        
        this.performanceMetrics.set(nodeId, monitoringData);
        this.emit('performanceUpdate', { nodeId, monitoringData });
    }
   
    private calculateFPS(): number {
        let lastFPS = 60; // Default FPS value
        
        this.page.evaluate(() => {
            const times: number[] = [];
            
            function refreshLoop() {
                window.requestAnimationFrame(() => {
                    const now = performance.now();
                    while (times.length > 0 && times[0] <= now - 1000) {
                        times.shift();
                    }
                    times.push(now);
                    window._lastFPS = times.length;
                    refreshLoop();
                });
            }
            
            refreshLoop();
        });
        
        return lastFPS;
    }
    
    
    
    private async rotateFingerprint(): Promise<void> {
        const availableFingerprints = Array.from(this.fingerprints.values());
        const currentFingerprint = availableFingerprints[Math.floor(Math.random() * availableFingerprints.length)];
        
        await this.page.evaluate((fp) => {
            Object.defineProperties(navigator, {
                userAgent: { get: () => fp.userAgent },
                platform: { get: () => fp.platform },
                languages: { get: () => fp.language }
            });
    
            window.screen = {
                ...window.screen,
                width: fp.viewport.width,
                height: fp.viewport.height
            };
        }, currentFingerprint);
    
        await this.context.setExtraHTTPHeaders({
            'User-Agent': currentFingerprint.userAgent
        });
    
        this.emit('fingerprintRotated', currentFingerprint);
    }
    
    
      // Anti-Detection System
      private async initializeStealthMode() {
        await this.injectEvasionScripts();
        await this.implementBehaviorPatterns();
      }
      private async implementBehaviorPatterns(): Promise<void> {
        // Implement natural mouse movements
        await this.page.evaluate(() => {
            const originalMouseMove = HTMLElement.prototype.dispatchEvent;
            HTMLElement.prototype.dispatchEvent = function(event: Event): boolean {
                if (event.type === 'mousemove') {
                    const delay = Math.random() * 20;
                    setTimeout(() => originalMouseMove.call(this, event), delay);
                    return true;
                }
                return originalMouseMove.call(this, event);
            };
        });
    
        // Add random delays to clicks
        await this.page.evaluate(() => {
            const originalClick = HTMLElement.prototype.click;
            HTMLElement.prototype.click = function(): void {
                const delay = Math.random() * 100 + 50;
                setTimeout(() => originalClick.call(this), delay);
            };
        });
    
        // Implement natural scroll behavior
        await this.page.evaluate(() => {
            window.addEventListener('scroll', () => {
                const scrollStep = Math.random() * 120 + 40;
                const scrollDelay = Math.random() * 50 + 20;
                let lastScroll = Date.now();
    
                if (Date.now() - lastScroll < scrollDelay) {
                    window.scrollBy(0, scrollStep);
                    lastScroll = Date.now();
                }
            }, { passive: true });
        });
    
        // Add random input delays
        await this.page.evaluate(() => {
            const originalValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
            if (originalValue) {
                Object.defineProperty(HTMLInputElement.prototype, 'value', {
                    set(value: string) {
                        const delay = Math.random() * 200 + 50;
                        setTimeout(() => originalValue.call(this, value), delay);
                    }
                });
            }
        });
    }
    
    
      private async injectEvasionScripts(): Promise<void> {
        await this.page.addInitScript(() => {
            // Override navigator properties
            const modifyNavigator = {
                webdriver: false,
                plugins: {
                    length: Math.floor(Math.random() * 8) + 1
                },
                languages: ['en-US', 'en'],
                platform: 'Win32'
            };
            
            Object.defineProperties(navigator, {
                webdriver: { get: () => modifyNavigator.webdriver },
                plugins: { get: () => modifyNavigator.plugins },
                languages: { get: () => modifyNavigator.languages },
                platform: { get: () => modifyNavigator.platform }
            });
    
            // Mask automation fingerprints
            const maskAutomation = () => {
                // Use Object.getPrototypeOf instead of __proto__
                const originalProto = Object.getPrototypeOf(navigator);
                const newProto = Object.create(originalProto);
                Object.setPrototypeOf(navigator, newProto);
                
                // Add custom permissions API
                window.Notification = {
                    permission: 'default',
                    requestPermission: () => Promise.resolve('default')
                } as any;
                
                // Randomize canvas fingerprint
                const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
                HTMLCanvasElement.prototype.toDataURL = function(type) {
                    const dataURL = originalToDataURL.call(this, type);
                    return dataURL.replace(/./g, (c) => 
                        Math.random() > 0.5 ? c : String.fromCharCode(c.charCodeAt(0) + 1)
                    );
                };
            };
    
            maskAutomation();
        });
    }
    
      // Export methods for external use
      public async exportExecutionHistory(flowId: string): Promise<any[]> {
        return this.executionHistory.get(flowId) || []
      }

      public async exportPerformanceMetrics(nodeId: string): Promise<any> {
        return this.performanceMetrics.get(nodeId);
      }
    }
    
    export default ConsoleVault;
 