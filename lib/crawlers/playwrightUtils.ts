import type { devices as playwrightDevices } from 'playwright';
import { BrowserContext } from 'playwright';

export type BrowserType = 'chromium' | 'firefox' | 'webkit';

export const browsers: readonly BrowserType[] = ['chromium', 'firefox', 'webkit'] as const;

type ClientDevices = Partial<typeof playwrightDevices>;

interface DeviceConfig {
  userAgent: string;
  viewport: { width: number; height: number };
  deviceScaleFactor: number;
  isMobile: boolean;
  hasTouch: boolean;
  defaultBrowserType: BrowserType;
  platform?: string;
  colorScheme?: 'light' | 'dark';
  geolocation?: { longitude: number; latitude: number };
  permissions?: string[];
}

const clientSideDevices: Record<string, DeviceConfig> = {
  'Desktop Chrome': { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36', viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1, isMobile: false, hasTouch: false, defaultBrowserType: 'chromium' },
  'Desktop Firefox': { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0', viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1, isMobile: false, hasTouch: false, defaultBrowserType: 'firefox' },
  'Desktop Safari': { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15', viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1, isMobile: false, hasTouch: false, defaultBrowserType: 'webkit' },
  'Desktop Edge': { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59', viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1, isMobile: false, hasTouch: false, defaultBrowserType: 'chromium' },
  'iPhone 12': { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1', viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, defaultBrowserType: 'webkit' },
  'iPhone 12 Pro': { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1', viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, defaultBrowserType: 'webkit' },
  'iPhone 12 Pro Max': { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1', viewport: { width: 428, height: 926 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, defaultBrowserType: 'webkit' },
  'iPhone 12 Mini': { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1', viewport: { width: 375, height: 812 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, defaultBrowserType: 'webkit' },
  'iPhone 13': { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1', viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, defaultBrowserType: 'webkit' },
  'iPhone SE': { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1', viewport: { width: 375, height: 667 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, defaultBrowserType: 'webkit' },
  'iPad (gen 7)': { userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1', viewport: { width: 810, height: 1080 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, defaultBrowserType: 'webkit' },
  'iPad Pro 11': { userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1', viewport: { width: 834, height: 1194 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, defaultBrowserType: 'webkit' },
  'iPad Air': { userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1', viewport: { width: 820, height: 1180 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, defaultBrowserType: 'webkit' },
  'Pixel 5': { userAgent: 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36', viewport: { width: 393, height: 851 }, deviceScaleFactor: 2.75, isMobile: true, hasTouch: true, defaultBrowserType: 'chromium' },
  'Pixel 4': { userAgent: 'Mozilla/5.0 (Linux; Android 10; Pixel 4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36', viewport: { width: 353, height: 745 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, defaultBrowserType: 'chromium' },
  'Pixel 4 XL': { userAgent: 'Mozilla/5.0 (Linux; Android 10; Pixel 4 XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36', viewport: { width: 412, height: 869 }, deviceScaleFactor: 3.5, isMobile: true, hasTouch: true, defaultBrowserType: 'chromium' },
  'Pixel 6': { userAgent: 'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Mobile Safari/537.36', viewport: { width: 412, height: 915 }, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true, defaultBrowserType: 'chromium' },
  'Samsung Galaxy S20': { userAgent: 'Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Mobile Safari/537.36', viewport: { width: 360, height: 800 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, defaultBrowserType: 'chromium' },
  'Samsung Galaxy S10': { userAgent: 'Mozilla/5.0 (Linux; Android 9; SM-G973U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.105 Mobile Safari/537.36', viewport: { width: 360, height: 760 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, defaultBrowserType: 'chromium' },
  'Samsung Galaxy S21': { userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36', viewport: { width: 360, height: 800 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, defaultBrowserType: 'chromium' },
  'OnePlus 9': { userAgent: 'Mozilla/5.0 (Linux; Android 11; OnePlus 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36', viewport: { width: 412, height: 919 }, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true, defaultBrowserType: 'chromium' },
  'Xiaomi Mi 11': { userAgent: 'Mozilla/5.0 (Linux; Android 11; M2011K2G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36', viewport: { width: 393, height: 873 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, defaultBrowserType: 'chromium' },
};


export const getPlaywrightDevices = async (): Promise<Partial<typeof playwrightDevices>> => {
  if (typeof window === 'undefined') {
    const { devices } = await import('playwright');
    return devices;
  }
  return clientSideDevices as unknown as Partial<typeof playwrightDevices>;
};

export const getPlaywrightBrowsers = (): BrowserType[] => [...browsers];

export const applyDeviceEmulation = async (context: BrowserContext, deviceName: string): Promise<void> => {
  const device = clientSideDevices[deviceName];
  if (!device) {
    throw new Error(`Device "${deviceName}" not found in the configuration.`);
  }

  await context.addInitScript((userAgent) => {
    Object.defineProperty(navigator, 'userAgent', { get: () => userAgent });
  }, device.userAgent);

  const page = await context.newPage();
  await page.setViewportSize(device.viewport);

  if (device.geolocation) {
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation(device.geolocation);
  }

  if (device.permissions) {
    await context.grantPermissions(device.permissions);
  }

  if (device.colorScheme) {
    await page.emulateMedia({ colorScheme: device.colorScheme });
  }
};

export const getRandomDevice = (): [string, DeviceConfig] => {
  const deviceNames = Object.keys(clientSideDevices);
  const randomIndex = Math.floor(Math.random() * deviceNames.length);
  const deviceName = deviceNames[randomIndex];
  return [deviceName, clientSideDevices[deviceName]];
};

export const createCustomDevice = (config: Partial<DeviceConfig>): DeviceConfig => {
  const baseConfig: DeviceConfig = {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
    defaultBrowserType: 'chromium',
  };
  return { ...baseConfig, ...config };
};