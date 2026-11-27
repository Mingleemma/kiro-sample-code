import type { DbSchema } from '@wellbeing/shared';

/**
 * Small persistence interface. The UI never touches localStorage directly,
 * so the storage backend can change without touching callers.
 */
export interface Store {
  /** Returns a fresh copy of the data. */
  read(): Promise<DbSchema>;
  /** Applies `mutate` to a copy of the data and saves it. */
  update<T>(mutate: (db: DbSchema) => T): Promise<T>;
}

export const STORAGE_KEY = 'wellbeing-companion:v1';

export function emptyDb(): DbSchema {
  return { version: 1, checkins: [], journal: [], feedback: [] };
}

/**
 * Store backed by the browser's localStorage (or any object with the same API).
 * The whole dataset is one JSON value under `key`.
 */
export function createLocalStore(storage: Storage, key = STORAGE_KEY): Store {
  function load(): DbSchema {
    const raw = storage.getItem(key);
    if (raw === null) return emptyDb();
    try {
      return normalize(JSON.parse(raw));
    } catch {
      // Never silently discard data: keep the unreadable value under a backup key,
      // then reset the main key so the backup is made only once.
      const db = emptyDb();
      storage.setItem(`${key}:corrupt-${Date.now()}`, raw);
      storage.setItem(key, JSON.stringify(db));
      console.warn('Stored wellbeing data was unreadable. A backup copy was kept; starting fresh.');
      return db;
    }
  }

  function save(db: DbSchema): void {
    try {
      storage.setItem(key, JSON.stringify(db));
    } catch (err) {
      if (err instanceof DOMException && err.name === 'QuotaExceededError') {
        throw new Error('Browser storage is full, so this change could not be saved.');
      }
      throw err;
    }
  }

  return {
    read: async () => load(),
    update: async (mutate) => {
      const db = load();
      const result = mutate(db);
      save(db);
      return result;
    },
  };
}

function normalize(value: unknown): DbSchema {
  const v = (value ?? {}) as Partial<DbSchema>;
  return {
    version: 1,
    checkins: Array.isArray(v.checkins) ? v.checkins : [],
    journal: Array.isArray(v.journal) ? v.journal : [],
    feedback: Array.isArray(v.feedback) ? v.feedback : [],
  };
}

/** The app's store, using this browser's localStorage. */
export const store: Store = createLocalStore(globalThis.localStorage);
