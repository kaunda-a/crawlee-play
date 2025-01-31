import axios, { AxiosInstance } from 'axios';

interface Proxy {
  host: string;
  port: number;
  protocol: string;
  type?: string;
  location?: string;
  enabled?: boolean;
}

export class ProxyManager {
  private proxies: string[];
  private currentProxyIndex: number = 0;

  constructor(proxies: string[]) {
    this.proxies = proxies;
  }

  async getNextHealthyProxy(): Promise<string> {
    let attempts = 0;
    while (attempts < this.proxies.length) {
      const proxy = this.proxies[this.currentProxyIndex];
      this.currentProxyIndex = (this.currentProxyIndex + 1) % this.proxies.length;
     
      if (await this.isProxyHealthy(proxy)) {
        return proxy;
      }
     
      attempts++;
    }
    throw new Error('No healthy proxies available');
  }

  private async isProxyHealthy(proxy: string): Promise<boolean> {
    const [host, port] = proxy.split(':');
    return this.checkProxyHealth({ host, port: parseInt(port), protocol: 'http' });
  }

  async checkProxyHealth(proxy: Proxy): Promise<boolean> {
    try {
      const axiosInstance = this.createAxiosInstance(proxy);
      await axiosInstance.get('https://api.ipify.org', { timeout: 5000 });
      return true;
    } catch (error) {
      console.error(`Proxy ${proxy.host}:${proxy.port} is not healthy:`, error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  private createAxiosInstance(proxy: Proxy): AxiosInstance {
    return axios.create({
      proxy: {
        host: proxy.host,
        port: proxy.port,
        protocol: proxy.protocol
      },
      timeout: 5000
    });
  }
}
