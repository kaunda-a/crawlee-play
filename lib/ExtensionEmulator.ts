import type { BrowserContext } from 'playwright';

export class ExtensionEmulator {
  async emulateCommonExtensions(context: BrowserContext) {
    await context.addInitScript(() => {
      if (typeof window !== 'undefined') {
      const createEvent = () => ({
        addListener: () => {},
        removeListener: () => {},
        hasListener: () => false,
        hasListeners: () => false,
        getRules: () => [],
        addRules: () => {},
        removeRules: () => {},
      
      });
    
      const createPort = () => ({
        disconnect: () => {},
        onDisconnect: createEvent(),
        onMessage: createEvent(),
        postMessage: () => {},
        name: '',
      });

      const createStorageArea = () => ({
        get: () => Promise.resolve({}),
        set: () => Promise.resolve(),
        remove: () => Promise.resolve(),
        clear: () => Promise.resolve(),
        getBytesInUse: () => Promise.resolve(0),
        QUOTA_BYTES: 5242880,
        MAX_SUSTAINED_WRITE_OPERATIONS_PER_MINUTE: 1000000,
        QUOTA_BYTES_PER_ITEM: 8192,
        MAX_ITEMS: 512,
        MAX_WRITE_OPERATIONS_PER_HOUR: 1800,
        MAX_WRITE_OPERATIONS_PER_MINUTE: 120,
        onChanged: createEvent(),
        setAccessLevel: (accessOptions: { accessLevel: string }) => Promise.resolve(),
      });

      const createWebRequest = () => ({
        onBeforeRequest: createEvent(),
        onBeforeSendHeaders: createEvent(),
        onHeadersReceived: createEvent(),
        onSendHeaders: createEvent(),
        onAuthRequired: createEvent(),
        onResponseStarted: createEvent(),
        onCompleted: createEvent(),
        onErrorOccurred: createEvent(),
        handlerBehaviorChanged: () => Promise.resolve(),
        MAX_HANDLER_BEHAVIOR_CHANGED_CALLS_PER_10_MINUTES: 20,
      });

      const createTab = () => ({
        id: 1,
        index: 0,
        pinned: false,
        highlighted: false,
        windowId: 1,
        active: false,
        incognito: false,
        selected: false,
        discarded: false,
        autoDiscardable: true,
        url: '',
        title: '',
        favIconUrl: '',
        status: 'complete',
        groupId: -1,
        openerTabId: undefined,
        width: 800,
        height: 600,
        sessionId: '',
      });

      window.chrome = {
        runtime: {
          connect: createPort,
          connectNative: (application: string) => {
            const port = createPort();
            port.name = application;
            return port;
          },
          getBackgroundPage: () => Promise.resolve(window as Window),
          getContexts: () => Promise.resolve([]),
          sendMessage: () => Promise.resolve(),
          onMessage: createEvent(),
          onConnect: createEvent(),
          onInstalled: createEvent(),
          onStartup: createEvent(),
          onSuspend: createEvent(),
          onSuspendCanceled: createEvent(),
          onUpdateAvailable: createEvent(),
          onRestartRequired: createEvent(),
          getManifest: () => ({}),
          getURL: (path: string) => '',
          getPlatformInfo: (callback: (platformInfo: any) => void) => {},
          getPackageDirectoryEntry: () => ({}),
          reload: () => {},
          requestUpdateCheck: () => Promise.resolve({ status: 'no_update' }),
          restart: () => {},
          restartAfterDelay: () => Promise.resolve(),
          setUninstallURL: (url: string) => Promise.resolve(),
          openOptionsPage: () => Promise.resolve(),
          id: '',
          lastError: null,
        } as unknown as typeof chrome.runtime,
        storage: {
          local: createStorageArea(),
          sync: createStorageArea(),
          managed: createStorageArea(),
          session: createStorageArea(),
          onChanged: createEvent(),
        } as unknown as typeof chrome.storage,
        tabs: {
          query: () => Promise.resolve([]),
          create: () => Promise.resolve(createTab()),
          update: () => Promise.resolve(createTab()),
          remove: () => Promise.resolve(),
          onCreated: createEvent(),
          onUpdated: createEvent(),
          onRemoved: createEvent(),
          executeScript: () => Promise.resolve([]),
          get: () => Promise.resolve(createTab()),
          getAllInWindow: () => Promise.resolve([]),
          getCurrent: () => Promise.resolve(createTab()),
        } as unknown as typeof chrome.tabs,
        webRequest: createWebRequest() as unknown as typeof chrome.webRequest,
      } as typeof chrome;
     }
    });
  }
}
