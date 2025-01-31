export interface Proxy {
  id?: string;
  type: 'residential' | 'ips' | 'datacenter' | 'mobileproxy';
  location: string;
  host: string;
  port: number;
  protocol: 'http' | 'https' | 'socks4' | 'socks5';
  username?: string;
  password?: string;
  enabled: boolean;
}
