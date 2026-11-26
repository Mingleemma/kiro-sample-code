import { Router } from 'express';
import { listCheckins, upsertCheckin } from '../services/checkins.js';
import type { Store } from '../store/jsonStore.js';
import { parseCheckInDate, parseMood, parseOptionalDate, parseText } from '../validation.js';

export const NOTE_MAX = 500;

export function checkinsRouter(store: Store): Router {
  const router = Router();

  // GET /api/checkins?from=YYYY-MM-DD&to=YYYY-MM-DD
  router.get('/', async (req, res) => {
    const from = parseOptionalDate(req.query.from, 'from');
    const to = parseOptionalDate(req.query.to, 'to');
    res.json(await listCheckins(store, from, to));
  });

  // PUT /api/checkins/:date  { mood: 1-5, note?: string }
  router.put('/:date', async (req, res) => {
    const date = parseCheckInDate(req.params.date);
    const mood = parseMood(req.body?.mood);
    const note = parseText(req.body?.note, { name: 'note', max: NOTE_MAX, required: false });
    const { checkin, created } = await upsertCheckin(store, date, mood, note);
    res.status(created ? 201 : 200).json(checkin);
  });

  return router;
}
