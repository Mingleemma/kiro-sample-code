import { Router } from 'express';
import type { CatalogItem, RecommendationsResponse } from '@wellbeing/shared';
import { evaluateIndicators } from '../domain/indicators.js';
import { buildInsights } from '../domain/insights.js';
import { moodBandFor, recommend } from '../domain/recommender.js';
import { HttpError } from '../http.js';
import { clearFeedback, setFeedback } from '../services/feedback.js';
import type { Store } from '../store/jsonStore.js';
import { parseRange, parseToday, parseVerdict } from '../validation.js';

/** Read-only insight endpoints plus recommendation feedback. */
export function wellbeingRouter(store: Store, catalog: CatalogItem[]): Router {
  const router = Router();
  const catalogIds = new Set(catalog.map((i) => i.id));

  // GET /api/indicators?today=YYYY-MM-DD
  router.get('/indicators', async (req, res) => {
    const today = parseToday(req.query.today);
    const { checkins } = await store.read();
    res.json(evaluateIndicators(checkins, today));
  });

  // GET /api/recommendations?today=YYYY-MM-DD
  router.get('/recommendations', async (req, res) => {
    const today = parseToday(req.query.today);
    const { checkins, feedback } = await store.read();
    const mood = checkins.find((c) => c.date === today)?.mood ?? null;
    const { level } = evaluateIndicators(checkins, today);
    const body: RecommendationsResponse = {
      date: today,
      moodBand: mood === null ? null : moodBandFor(mood),
      level,
      items: recommend(catalog, mood, level, feedback, today),
    };
    res.json(body);
  });

  // POST /api/recommendations/:id/feedback  { verdict: "helpful" | "not_for_me" }
  router.post('/recommendations/:id/feedback', async (req, res) => {
    const id = req.params.id;
    if (!catalogIds.has(id)) throw new HttpError(404, 'Recommendation not found.');
    res.status(201).json(await setFeedback(store, id, parseVerdict(req.body?.verdict)));
  });

  // DELETE /api/recommendations/:id/feedback  (undo)
  router.delete('/recommendations/:id/feedback', async (req, res) => {
    const id = req.params.id;
    if (!catalogIds.has(id)) throw new HttpError(404, 'Recommendation not found.');
    await clearFeedback(store, id);
    res.status(204).end();
  });

  // GET /api/trends?range=7|30&today=YYYY-MM-DD
  router.get('/trends', async (req, res) => {
    const range = parseRange(req.query.range);
    const today = parseToday(req.query.today);
    const { checkins } = await store.read();
    res.json(buildInsights(checkins, today, range));
  });

  return router;
}
