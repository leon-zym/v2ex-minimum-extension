/**
 * Global test setup.
 * Mock browser extension APIs that don't exist in jsdom.
 */
const storageMock: Record<string, unknown> = {};

const storageArea = {
  get: async (key: string) => {
    if (typeof key === 'string') {
      return { [key]: storageMock[key] };
    }
    return storageMock;
  },
  set: async (items: Record<string, unknown>) => {
    Object.assign(storageMock, items);
    return undefined;
  },
  remove: async (key: string) => {
    delete storageMock[key];
  },
  clear: async () => {
    for (const key of Object.keys(storageMock)) {
      delete storageMock[key];
    }
  },
};

const listeners: Array<(...args: unknown[]) => void> = [];

const browserMock = {
  storage: {
    local: storageArea,
    onChanged: {
      addListener: (fn: (...args: unknown[]) => void) => {
        listeners.push(fn);
      },
      removeListener: (fn: (...args: unknown[]) => void) => {
        const idx = listeners.indexOf(fn);
        if (idx >= 0) listeners.splice(idx, 1);
      },
    },
  },
  runtime: {
    getManifest: () => ({ version: '0.1.0' }),
    onInstalled: {
      addListener: () => {},
    },
  },
};

Object.assign(globalThis, { browser: browserMock, chrome: browserMock });
