import { Proxy } from './Proxy';

export interface Bot {
  _id: string;
  network: string | number | readonly string[] | undefined;
  os?: string;  // Make 'os' optional by adding '?'
  device: string;
  browser: string;
  name: string;
  userAgent: string;
  proxy?: Proxy | string; // {{ edit_1 }} Allow proxy to be either Proxy type or string
  viewport?: string;
  args?: string[];
  type: string;
  category: string;
  fingerprint: BrowserFingerprint;
  browserVersion?: string;
  targetDomain?: string;
  pagesToVisit?: string[];

}

export interface BrowserFingerprint {
  userAgent: string;
  hardwareConcurrency: number;
  deviceMemory: number;
  platform: string;
  timezone: string;
  locale: string;
  canvas: string;
  webgl: string;
  webRTC: string;
  battery: string;
  audioContext: string;
  cpuClass: string | undefined;
  productSub: string;
  oscpu: string;
  hardwareFamily: string;
  fonts: string[];
  vendorSub: string;
  plugins: string[];
  colorDepth: number;
  doNotTrack: string | null;
  touchSupport: string[];
  devicePixelRatio: number;
  webGLVendor: string;
  webGLRenderer: string;
  screenResolution: string;
  availableScreenResolution: string;
  pixelRatio: number;
}

interface BotCategory {
  _id: string;
  name: string;
}