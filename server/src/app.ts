import express, { type Express } from 'express';
import type { CatalogItem } from '@wellbeing/shared';
import { errorHandler, HttpError } from './http.js';
import { checkinsRouter } from './routes/checkins.js';
import { journalRouter } from './routes/journal.js';
import { wellbeingRouter } from './routes/wellbeing.js';
import type { Store } from './store/jsonStore.js';

export interface AppDeps {
  store: Store;
  catalog: CatalogItem[];
}

/** Builds the Express app without listening, so it can be reused by future API tests. */
export function createApp({ store, catalog }: AppDeps): Express {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '50kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });
  app.use('/api/checkins', checkinsRouter(store));
  app.use('/api/journal', journalRouter(store));
  app.use('/api', wellbeingRouter(store, catalog));

  app.use('/api', () => {
    throw new HttpError(404, 'Not found.');
  });
  app.use(errorHandler);
  return app;
}
