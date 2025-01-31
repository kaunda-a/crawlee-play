export type Action =
  | { type: 'click'; selector: string }
  | {
    text?: string; type: 'type'; selector: string; value: string 
}
  | {
    time: string; type: 'wait'; duration?: number 
}
  | { type: 'scroll'; value?: string }
  | { type: 'moveMouse'; x: number; y: number }
  | { type: 'hover'; selector: string }
  | { type: 'dragAndDrop'; sourceSelector: string; targetSelector: string };
 

  export interface ProxyConfig {
    id: string;
    type: string;
    protocol: 'http' | 'https' | 'socks4' | 'socks5';
    host: string;
    port: number;
    username?: string;
    password?: string;
  }
  