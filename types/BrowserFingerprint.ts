export interface BrowserFingerprint {
    canvas: string;
    webgl: string;
    audioContext: string;
    fonts: string[];
    plugins: string[];
    hardwareConcurrency: number;
    deviceMemory: number;
    timezone: string;
    locale: string;
    colorDepth: number;
    touchSupport: string[];
    doNotTrack: string | null;
    webRTC: string;
    battery: string;
    cpuClass: string | undefined;
    platform: string;
    vendorSub: string;
    productSub: string;
    oscpu: string;
    hardwareFamily: string;
    devicePixelRatio: number;
    pixelRatio: number;
    webGLVendor: string;
    webGLRenderer: string;
    screenResolution: string;
    availableScreenResolution: string;
    userAgent: string;
  }