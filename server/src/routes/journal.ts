import { Router } from 'express';
import { createEntry, deleteEntry, listEntries, updateEntry } from '../services/journal.js';
import type { Store } from '../store/jsonStore.js';
import { parseText } from '../validation.js';

export const JOURNAL_MAX = 5000;

const parseEntryText = (value: unknown) =>
  parseText(value, { name: 'text', max: JOURNAL_MAX, required: true })!;

export function journalRouter(store: Store): Router {
  const router = Router();

  router.get('/', async (_req, res) => {
    res.json(await listEntries(store));
  });

  router.post('/', async (req, res) => {
    res.status(201).json(await createEntry(store, parseEntryText(req.body?.text)));
  });

  router.put('/:id', async (req, res) => {
    res.json(await updateEntry(store, req.params.id, parseEntryText(req.body?.text)));
  });

  router.delete('/:id', async (req, res) => {
    await deleteEntry(store, req.params.id);
    res.status(204).end();
  });

  return router;
}
