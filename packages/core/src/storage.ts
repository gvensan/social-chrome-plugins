interface StorageArea {
  get(keys?: string | string[] | null): Promise<Record<string, unknown>>;
  set(items: Record<string, unknown>): Promise<void>;
  remove(keys: string | string[]): Promise<void>;
  clear(): Promise<void>;
}

const inMemoryStore = new Map<string, unknown>();

const memoryArea: StorageArea = {
  async get(keys) {
    if (keys === undefined || keys === null) {
      return Object.fromEntries(inMemoryStore);
    }
    const arr = Array.isArray(keys) ? keys : [keys];
    const out: Record<string, unknown> = {};
    for (const k of arr) {
      if (inMemoryStore.has(k)) out[k] = inMemoryStore.get(k);
    }
    return out;
  },
  async set(items) {
    for (const [k, v] of Object.entries(items)) inMemoryStore.set(k, v);
  },
  async remove(keys) {
    const arr = Array.isArray(keys) ? keys : [keys];
    for (const k of arr) inMemoryStore.delete(k);
  },
  async clear() {
    inMemoryStore.clear();
  },
};

const detectArea = (): StorageArea => {
  const c = (globalThis as { chrome?: typeof chrome }).chrome;
  if (c?.storage?.local) {
    return c.storage.local as unknown as StorageArea;
  }
  return memoryArea;
};

const area = detectArea();

export const loadKey = async <T>(key: string, fallback: T): Promise<T> => {
  const result = await area.get(key);
  const value = result[key];
  return value === undefined ? fallback : (value as T);
};

export const saveKey = async (
  key: string,
  value: unknown
): Promise<void> => {
  await area.set({ [key]: value });
};

export const removeKey = async (key: string): Promise<void> => {
  await area.remove(key);
};

export const dumpAll = async (): Promise<Record<string, unknown>> => {
  return area.get(null);
};

export const importAll = async (
  data: Record<string, unknown>
): Promise<void> => {
  await area.set(data);
};

/**
 * Wipe every key in the plugin's storage area. `chrome.storage.local`
 * is per-extension, so this only affects the calling plugin — there
 * is no risk of touching another extension's state.
 *
 * Used by restore to enforce replacement semantics: any key present
 * locally but absent from the imported payload must be removed,
 * otherwise an "old export" import would silently leave newer keys
 * in place.
 */
export const clearAll = async (): Promise<void> => {
  await area.clear();
};

/**
 * Test-only escape hatch: reset the in-memory fallback store between
 * test cases. No-ops in a real chrome environment because the
 * detected area there is `chrome.storage.local`, not `memoryArea`.
 */
export const __resetMemoryStoreForTests = (): void => {
  inMemoryStore.clear();
};
