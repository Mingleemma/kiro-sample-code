import { fileURLToPath } from 'node:url';

/** Where wellbeing data lives. Override with WELLBEING_DATA_FILE. */
export const DATA_FILE =
  process.env.WELLBEING_DATA_FILE ?? fileURLToPath(new URL('../data/db.json', import.meta.url));

export const CATALOG_URL = new URL('./data/catalog.json', import.meta.url);

export const PORT = Number(process.env.PORT ?? 3001);

// Bind to loopback only: this app holds personal data and has no login.
export const HOST = '127.0.0.1';
