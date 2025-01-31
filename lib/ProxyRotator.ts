import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ProxyAgent } from 'proxy-agent';

interface Proxy {
  host: string;
  port: number;
  protocol: 'http' | 'https';
  auth?: {
    username: string;
    password: string;
  };
}

export class ProxyRotator {
  getRandomProxy(): string | import("../types/Proxy").Proxy | undefined {
    throw new Error('Method not implemented.');
  }
  private proxies: Proxy[];
  private currentProxyIndex: number;
  private maxRetries: number;
  private retryDelay: number;

  constructor(proxies: Proxy[], maxRetries: number = 3, retryDelay: number = 1000) {
    this.proxies = proxies;
    this.currentProxyIndex = 0;
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
  }

  async getProxy(location?: string): Promise<string> {
    const proxy = this.getNextProxy(location);
    return `${proxy.protocol}://${proxy.host}:${proxy.port}`;
  }

  private getNextProxy(location?: string): Proxy {
    if (location) {
      const locationProxy = this.proxies.find(p => p.host.includes(location));
      if (locationProxy) return locationProxy;
    }
    const proxy = this.proxies[this.currentProxyIndex];
    this.currentProxyIndex = (this.currentProxyIndex + 1) % this.proxies.length;
    return proxy;
  }

  private createAxiosInstance(proxy: Proxy): AxiosInstance {
    const proxyUrl = `${proxy.protocol}://${proxy.host}:${proxy.port}`;
    const agent = new ProxyAgent(proxyUrl as any);

    const config: AxiosRequestConfig = {
      httpsAgent: agent,
      httpAgent: agent,
      proxy: false,
      timeout: 5000
    };

    if (proxy.auth) {
      config.auth = proxy.auth;
    }

    return axios.create(config);
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public async request(url: string, options: AxiosRequestConfig = {}): Promise<any> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      const proxy = this.getNextProxy();
      const axiosInstance = this.createAxiosInstance(proxy);

      try {
        const response = await axiosInstance(url, options);
        return response.data;
      } catch (error) {
        console.error(`Attempt ${attempt + 1} failed with proxy ${proxy.host}:${proxy.port}`);
        lastError = error as Error;

        if (attempt < this.maxRetries - 1) {
          await this.delay(this.retryDelay);
        }
      }
    }

    throw new Error(`All retry attempts failed. Last error: ${lastError?.message}`);
  }

  public addProxy(proxy: Proxy): void {
    this.proxies.push(proxy);
  }

  public removeProxy(host: string, port: number): void {
    this.proxies = this.proxies.filter(p => !(p.host === host && p.port === port));
  }

  public getProxies(): Proxy[] {
    return [...this.proxies];
  }

  public async testProxies(): Promise<Proxy[]> {
    const workingProxies: Proxy[] = [];
    for (const proxy of this.proxies) {
      try {
        const axiosInstance = this.createAxiosInstance(proxy);
        await axiosInstance.get('https://api.ipify.org');
        workingProxies.push(proxy);
      } catch (error) {
        console.error(`Proxy ${proxy.host}:${proxy.port} is not working`);
      }
    }
    return workingProxies;
  }
}

export default ProxyRotator;
