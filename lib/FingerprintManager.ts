import { BrowserFingerprint } from '../types/Bot';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';
import { BrowserContext } from 'playwright-core';

export class FingerprintManager {
  private appliedFingerprint: BrowserFingerprint | null = null;

  static generateFingerprint(): BrowserFingerprint {
    const instance = new FingerprintManager();
    return instance.generateFingerprint();
  }

  generateFingerprint(): BrowserFingerprint {
    this.appliedFingerprint = {
      canvas: this.generateCanvasFingerprint(),
      webgl: this.generateWebGLFingerprint(),
      audioContext: this.generateAudioFingerprint(),
      fonts: this.generateFontList(),
      plugins: this.generatePluginList(),
      hardwareConcurrency: this.generateHardwareConcurrency(),
      deviceMemory: this.generateDeviceMemory(),
      timezone: this.generateTimezone(),
      locale: this.generateLocale(),
      colorDepth: this.generateColorDepth(),
      touchSupport: this.generateTouchSupport(),
      doNotTrack: this.generateDoNotTrack(),
      webRTC: this.generateWebRTCFingerprint(),
      battery: this.generateBatteryFingerprint(),
      cpuClass: this.generateCPUClass(),
      platform: this.generatePlatform(),
      vendorSub: this.generateVendorSub(),
      productSub: this.generateProductSub(),
      oscpu: this.generateOscpu(),
      hardwareFamily: this.generateHardwareFamily(),
      devicePixelRatio: this.generateDevicePixelRatio(),
      pixelRatio: this.generateDevicePixelRatio(),
      webGLVendor: this.generateWebGLVendor(),
      webGLRenderer: this.generateWebGLRenderer(),
      screenResolution: this.generateScreenResolution(),
      availableScreenResolution: this.generateAvailableScreenResolution(),
      userAgent: this.generateUserAgent(),
    };
    return this.appliedFingerprint;
  }

  async applyEvasionTechniques(context: BrowserContext): Promise<void> {
    if (!this.appliedFingerprint) {
      this.generateFingerprint();
    }

    if (this.appliedFingerprint) {
      await context.addInitScript((fp) => {
        Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => fp.hardwareConcurrency });
        Object.defineProperty(navigator, 'deviceMemory', { get: () => fp.deviceMemory });
        Object.defineProperty(navigator, 'platform', { get: () => fp.platform });
        Object.defineProperty(navigator, 'userAgent', { get: () => fp.userAgent });
        Object.defineProperty(screen, 'colorDepth', { get: () => fp.colorDepth });
        Object.defineProperty(screen, 'pixelDepth', { get: () => fp.colorDepth });
        Object.defineProperty(window, 'devicePixelRatio', { get: () => fp.devicePixelRatio });
      }, this.appliedFingerprint);
    }

    await context.addInitScript(() => {
      const originalQuery = window.navigator.permissions.query;
      // @ts-ignore
      window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission }) :
          originalQuery(parameters)
      );
    });
  }

  getAppliedFingerprint(): BrowserFingerprint | null {
    return this.appliedFingerprint;
  }

  private generateWebGLVendor(): string {
    const vendors = ['NVIDIA Corporation', 'Intel Inc.', 'AMD', 'Apple'];
    return vendors[this.getRandomInt(0, vendors.length - 1)];
  }
  
  private generateWebGLRenderer(): string {
    const renderers = ['NVIDIA GeForce GTX 1080', 'Intel Iris Pro Graphics 6200', 'AMD Radeon RX 580', 'Apple M1'];
    return renderers[this.getRandomInt(0, renderers.length - 1)];
  }
  
  private generateAvailableScreenResolution(): string {
    return this.generateScreenResolution();
  }
  
  private generateCanvasFingerprint(): string {
    const canvas = this.simulateCanvasRendering();
    return this.hashFingerprint(canvas);
  }

  private generateWebGLFingerprint(): string {
    const webgl = this.simulateWebGLRendering();
    return this.hashFingerprint(webgl);
  }

  private generateAudioFingerprint(): string {
    const audio = this.simulateAudioProcessing();
    return this.hashFingerprint(audio);
  }

  private generateFontList(): string[] {
    const allFonts = [
      'Arial', 'Helvetica', 'Times New Roman', 'Courier', 'Verdana', 'Georgia', 'Palatino',
      'Garamond', 'Bookman', 'Comic Sans MS', 'Trebuchet MS', 'Arial Black', 'Impact',
      'Tahoma', 'Calibri', 'Cambria', 'Segoe UI', 'Roboto', 'Open Sans', 'Lato', 'Montserrat'
    ];
    return this.shuffleArray(allFonts).slice(0, this.getRandomInt(5, 15));
  }

  private generatePluginList(): string[] {
    const allPlugins = [
      'Chrome PDF Plugin', 'Chrome PDF Viewer', 'Native Client', 'Adobe Acrobat',
      'QuickTime Plug-in', 'Microsoft Office', 'iTunes Application Detector',
      'Java Applet Plug-in', 'Shockwave Flash', 'Silverlight Plug-In', 'Unity Player',
      'VLC Multimedia Plugin', 'RealPlayer Version Plugin', 'Windows Media Player Plug-in'
    ];
    return this.shuffleArray(allPlugins).slice(0, this.getRandomInt(2, 6));
  }

  private generateHardwareConcurrency(): number {
    return Math.pow(2, this.getRandomInt(1, 5));
  }

  private generateDeviceMemory(): number {
    const memories = [0.5, 1, 2, 4, 8, 16, 32];
    return memories[this.getRandomInt(0, memories.length - 1)];
  }

  private generateTimezone(): string {
    const timezones = [
      'America/New_York', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney',
      'America/Los_Angeles', 'Europe/Paris', 'Asia/Shanghai', 'Africa/Cairo',
      'America/Sao_Paulo', 'Asia/Dubai', 'Pacific/Auckland', 'Europe/Moscow'
    ];
    return timezones[this.getRandomInt(0, timezones.length - 1)];
  }

  private generateLocale(): string {
    const locales = [
      'en-US', 'en-GB', 'fr-FR', 'de-DE', 'ja-JP', 'zh-CN', 'es-ES',
      'it-IT', 'ru-RU', 'pt-BR', 'ko-KR', 'ar-SA', 'hi-IN', 'nl-NL'
    ];
    return locales[this.getRandomInt(0, locales.length - 1)];
  }

  private generateScreenResolution(): string {
    const resolutions = [
      '1366x768', '1920x1080', '1280x720', '1440x900',
      '1536x864', '1600x900', '1280x1024', '2560x1440'
    ];
    return resolutions[this.getRandomInt(0, resolutions.length - 1)];
  }

  private generateColorDepth(): number {
    return [16, 24, 32][this.getRandomInt(0, 2)];
  }

  private generateTouchSupport(): string[] {
    const touchFeatures = ['maxTouchPoints', 'touchEvent', 'touchStart'];
    return this.shuffleArray(touchFeatures).slice(0, this.getRandomInt(1, 3));
  }

  private generateDoNotTrack(): string | null {
    return ['1', '0', null][this.getRandomInt(0, 2)];
  }

  private generateWebRTCFingerprint(): string {
    return this.hashFingerprint(uuidv4());
  }

  private generateBatteryFingerprint(): string {
    return this.hashFingerprint(JSON.stringify({
      charging: Math.random() > 0.5,
      chargingTime: this.getRandomInt(0, 1000),
      dischargingTime: this.getRandomInt(1000, 5000),
      level: Math.random()
    }));
  }

  private generateCPUClass(): string | undefined {
    return ['x86', 'x86-64', 'arm', undefined][this.getRandomInt(0, 3)];
  }

  private generatePlatform(): string {
    return ['Win32', 'MacIntel', 'Linux x86_64', 'Linux armv7l'][this.getRandomInt(0, 3)];
  }

  private generateVendorSub(): string {
    return '';
  }

  private generateProductSub(): string {
    return ['20030107', '20100101'][this.getRandomInt(0, 1)];
  }

  private generateOscpu(): string {
    return ['Windows NT 10.0; Win64; x64', 'Intel Mac OS X 10_15_7', 'Linux x86_64'][this.getRandomInt(0, 2)];
  }

  private generateHardwareFamily(): string {
    return ['Windows', 'Macintosh', 'Linux'][this.getRandomInt(0, 2)];
  }

  private generateDevicePixelRatio(): number {
    return [1, 1.25, 1.5, 2, 3][this.getRandomInt(0, 4)];
  }

  private simulateCanvasRendering(): string {
    return `canvas_${this.getRandomInt(1000000, 9999999)}`;
  }

  private simulateWebGLRendering(): string {
    return `webgl_${this.getRandomInt(1000000, 9999999)}`;
  }

  private simulateAudioProcessing(): string {
    return `audio_${this.getRandomInt(1000000, 9999999)}`;
  }

  private hashFingerprint(input: string): string {
    return createHash('sha256').update(input).digest('hex');
  }

  private shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  private getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private generateUserAgent(): string {
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.101 Safari/537.36'
    ];
    return userAgents[this.getRandomInt(0, userAgents.length - 1)];
  }
}
