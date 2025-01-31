export const TimeZones = [
    'America/New_York',
    'Europe/London',
    'Asia/Tokyo',
    'Australia/Sydney',
    'Pacific/Auckland',
    'Europe/Paris',
    'Asia/Singapore',
    'America/Los_Angeles',
    'Europe/Berlin',
    'Asia/Dubai'
  ];
  
  export const Languages = [
    ['en-US', 'en'],
    ['fr-FR', 'fr'],
    ['de-DE', 'de'],
    ['ja-JP', 'ja'],
    ['es-ES', 'es'],
    ['zh-CN', 'zh'],
    ['ko-KR', 'ko'],
    ['it-IT', 'it'],
    ['pt-BR', 'pt'],
    ['ru-RU', 'ru']
  ];
  
  export const Platforms = [
    'Windows NT 10.0',
    'Macintosh; Intel Mac OS X 10_15_7',
    'Linux x86_64',
    'iPhone; CPU iPhone OS 14_7_1',
    'iPad; CPU OS 14_7_1',
    'Android 11',
    'Windows NT 11.0'
  ];
  
  export const BrowserProfiles = {
    chrome: {
      name: 'Chrome',
      versions: ['91.0.4472.124', '92.0.4515.107', '93.0.4577.63'],
      engines: ['AppleWebKit/537.36', 'Blink'],
      features: ['PDF Viewer', 'Chrome PDF Viewer', 'Chromium PDF Viewer']
    },
    firefox: {
      name: 'Firefox',
      versions: ['89.0', '90.0', '91.0'],
      engines: ['Gecko'],
      features: ['PDF Reader', 'Firefox PDF Viewer']
    },
    safari: {
      name: 'Safari',
      versions: ['14.1.2', '15.0', '15.1'],
      engines: ['AppleWebKit/605.1.15'],
      features: ['Apple PDF Viewer']
    }
  };
  
  export const WebGLVendors = [
    'Google Inc. (NVIDIA)',
    'Intel Inc.',
    'AMD',
    'Apple GPU',
    'Microsoft Basic Render Driver'
  ];
  
  export const WebGLRenderers = [
    'ANGLE (NVIDIA GeForce RTX 3080 Direct3D11 vs_5_0)',
    'ANGLE (Intel(R) UHD Graphics Direct3D11 vs_5_0)',
    'ANGLE (AMD Radeon RX 6800 XT Direct3D11 vs_5_0)',
    'Apple M1',
    'Mesa DRI Intel(R) UHD Graphics 630 (CFL GT2)'
  ];
  
  export const ScreenResolutions = [
    { width: 1920, height: 1080 },
    { width: 1366, height: 768 },
    { width: 1440, height: 900 },
    { width: 2560, height: 1440 },
    { width: 3840, height: 2160 }
  ];
  
  export const DeviceMemoryOptions = [2, 4, 8, 16, 32];
  
  export const HardwareConcurrencyOptions = [2, 4, 6, 8, 12, 16];
  
  export const BatteryLevels = {
    min: 0.05,
    max: 1.0,
    steps: 0.01
  };
  
  export const NetworkConditions = {
    '4G': {
      download: 4 * 1024 * 1024,
      upload: 1 * 1024 * 1024,
      latency: 20
    },
    '3G': {
      download: 1.6 * 1024 * 1024,
      upload: 750 * 1024,
      latency: 100
    },
    '2G': {
      download: 450 * 1024,
      upload: 150 * 1024,
      latency: 300
    }
  };
  
  export const CommonPlugins = [
    'PDF Viewer',
    'Chrome PDF Viewer',
    'Chromium PDF Viewer',
    'Microsoft Edge PDF Viewer',
    'WebKit built-in PDF',
    'Flash Player',
    'QuickTime Player',
    'VLC Player Plugin',
    'Native Client'
  ];
  
  export const UserBehaviorPatterns = {
    typing: {
      minDelay: 50,
      maxDelay: 200,
      mistakeProbability: 0.05
    },
    mouse: {
      minSpeed: 800,
      maxSpeed: 2000,
      naturalCurve: true
    },
    scroll: {
      smooth: true,
      minDuration: 500,
      maxDuration: 2000
    }
  };
  
  export const StealthModeConfig = {
    enabledByDefault: true,
    features: [
      'webdriver',
      'chrome',
      'permissions',
      'plugins',
      'navigator',
      'hardware',
      'battery'
    ]
  };
  
  export const DebugLevels = {
    NONE: 0,
    ERROR: 1,
    WARN: 2,
    INFO: 3,
    DEBUG: 4,
    TRACE: 5
  };
  