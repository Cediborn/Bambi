/**
 * db/storage.ts — the persistence boundary.
 *
 * The application talks to a tiny `StorageAdapter` interface and never
 * needs to know the underlying implementation. Production uses
 * localStorage (`defaultStorage`); tests inject an in-memory adapter, and
 * a future backend can provide its own without touching the reducer, the
 * provider, or the UI.
 */
export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface MemoryStorage extends StorageAdapter {
  /** A plain-object copy of everything stored — handy for assertions. */
  snapshot(): Record<string, string>;
}

/** An in-memory adapter — used by tests and as a safe fallback. */
export function createMemoryStorage(initial: Record<string, string> = {}): MemoryStorage {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (key) => (map.has(key) ? map.get(key)! : null),
    setItem: (key, value) => {
      map.set(key, value);
    },
    removeItem: (key) => {
      map.delete(key);
    },
    snapshot: () => Object.fromEntries(map),
  };
}

function browserStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    // Storage disabled (private mode / blocked cookies).
    return null;
  }
}

/**
 * The default localStorage-backed adapter. Every call is guarded, so
 * quota errors or disabled browser storage never crash the app — worst
 * case the state simply stays in memory for the session.
 */
export function createBrowserStorageAdapter(): StorageAdapter {
  return {
    getItem(key) {
      const storage = browserStorage();
      if (!storage) return null;
      try {
        return storage.getItem(key);
      } catch {
        return null;
      }
    },
    setItem(key, value) {
      const storage = browserStorage();
      if (!storage) return;
      try {
        storage.setItem(key, value);
      } catch {
        // Quota exceeded or storage unavailable — keep working in memory.
      }
    },
    removeItem(key) {
      const storage = browserStorage();
      if (!storage) return;
      try {
        storage.removeItem(key);
      } catch {
        // Non-fatal.
      }
    },
  };
}

/** The adapter production code uses. */
export const defaultStorage: StorageAdapter = createBrowserStorageAdapter();
