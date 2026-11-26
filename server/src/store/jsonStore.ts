import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { DbSchema } from '@wellbeing/shared';

/**
 * Small persistence interface so the JSON file can be swapped for
 * another backend (or a temp file in future tests) without touching callers.
 */
export interface Store {
  /** Returns a snapshot copy of the data. */
  read(): Promise<DbSchema>;
  /**
   * Applies `mutate` to a copy of the data and persists it atomically.
   * Updates run one at a time, so concurrent requests cannot lose writes.
   */
  update<T>(mutate: (db: DbSchema) => T): Promise<T>;
}

export function emptyDb(): DbSchema {
  return { version: 1, checkins: [], journal: [], feedback: [] };
}

export function createJsonStore(filePath: string): Store {
  // Every operation goes through this queue, so reads never see a half-applied update.
  let queue: Promise<unknown> = Promise.resolve();

  function enqueue<T>(task: () => Promise<T>): Promise<T> {
    const run = queue.then(task, task);
    queue = run.catch(() => undefined);
    return run;
  }

  // The file is re-read on every call (it is small). This keeps the server
  // correct if `npm run seed` edits the file while the server is running.
  async function load(): Promise<DbSchema> {
    let raw: string;
    try {
      raw = await fs.readFile(filePath, 'utf8');
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        const db = emptyDb();
        await persist(db);
        return db;
      }
      throw err;
    }
    try {
      return normalize(JSON.parse(raw));
    } catch {
      throw new Error(
        `Data file ${filePath} is not valid JSON. Fix or move it aside; a new one will be created.`,
      );
    }
  }

  async function persist(db: DbSchema): Promise<void> {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    const tmp = `${filePath}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(db, null, 2), 'utf8');
    await renameWithRetry(tmp, filePath);
  }

  return {
    read: () => enqueue(load),
    update: (mutate) =>
      enqueue(async () => {
        const db = await load();
        const result = mutate(db);
        await persist(db);
        return result;
      }),
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

// On Windows, antivirus or indexers can briefly lock the target file.
async function renameWithRetry(from: string, to: string, attempts = 5): Promise<void> {
  for (let i = 1; ; i++) {
    try {
      await fs.rename(from, to);
      return;
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (i >= attempts || (code !== 'EPERM' && code !== 'EBUSY' && code !== 'EACCES')) throw err;
      await new Promise((r) => setTimeout(r, 50 * i));
    }
  }
}
