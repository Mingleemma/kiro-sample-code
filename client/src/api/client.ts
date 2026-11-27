// The app's data API. Everything runs in the browser and is stored in
// localStorage; there is no server. Methods are async and keep the same
// shape the components expect, so the storage backend can change later.

import type {
  CheckIn,
  Feedback,
  IndicatorResult,
  IsoDate,
  JournalEntry,
  Mood,
  RecommendationsResponse,
  TrendRange,
  TrendsResponse,
  Verdict,
} from '@wellbeing/shared';
import { catalog } from '../data/catalog';
import { buildSampleData } from '../data/sampleData';
import { evaluateIndicators } from '../domain/indicators';
import { buildInsights } from '../domain/insights';
import { moodBandFor, recommend } from '../domain/recommender';
import { listCheckins, upsertCheckin } from '../services/checkins';
import { clearFeedback, setFeedback } from '../services/feedback';
import { createEntry, deleteEntry, listEntries, updateEntry } from '../services/journal';
import { emptyDb, store } from '../store/localStore';
import {
  JOURNAL_MAX,
  NOTE_MAX,
  parseDate,
  parseMood,
  parseRange,
  parseText,
  parseVerdict,
  ValidationError,
} from '../validation';

const catalogIds = new Set(catalog.map((i) => i.id));

function assertCatalogItem(id: string): void {
  if (!catalogIds.has(id)) throw new ValidationError('That suggestion no longer exists.');
}

const parseEntryText = (value: unknown) =>
  parseText(value, { name: 'Entry', max: JOURNAL_MAX, required: true })!;

export const api = {
  // ---- Check-ins ----
  listCheckins: async (from: IsoDate, to: IsoDate): Promise<CheckIn[]> =>
    listCheckins(store, parseDate(from, 'from'), parseDate(to, 'to')),

  saveCheckin: async (date: IsoDate, mood: Mood, note: string): Promise<CheckIn> => {
    const { checkin } = await upsertCheckin(
      store,
      parseDate(date, 'date'),
      parseMood(mood),
      parseText(note, { name: 'Note', max: NOTE_MAX, required: false }),
    );
    return checkin;
  },

  // ---- Journal ----
  listJournal: async (): Promise<JournalEntry[]> => listEntries(store),
  createJournal: async (text: string): Promise<JournalEntry> => createEntry(store, parseEntryText(text)),
  updateJournal: async (id: string, text: string): Promise<JournalEntry> =>
    updateEntry(store, id, parseEntryText(text)),
  deleteJournal: async (id: string): Promise<void> => deleteEntry(store, id),

  // ---- Indicator ----
  indicators: async (today: IsoDate): Promise<IndicatorResult> => {
    const { checkins } = await store.read();
    return evaluateIndicators(checkins, parseDate(today, 'today'));
  },

  // ---- Recommendations ----
  recommendations: async (today: IsoDate): Promise<RecommendationsResponse> => {
    const day = parseDate(today, 'today');
    const { checkins, feedback } = await store.read();
    const mood = checkins.find((c) => c.date === day)?.mood ?? null;
    const { level } = evaluateIndicators(checkins, day);
    return {
      date: day,
      moodBand: mood === null ? null : moodBandFor(mood),
      level,
      items: recommend(catalog, mood, level, feedback, day),
    };
  },
  setFeedback: async (id: string, verdict: Verdict): Promise<Feedback> => {
    assertCatalogItem(id);
    return setFeedback(store, id, parseVerdict(verdict));
  },
  clearFeedback: async (id: string): Promise<void> => {
    assertCatalogItem(id);
    return clearFeedback(store, id);
  },

  // ---- Trends ----
  trends: async (range: TrendRange, today: IsoDate): Promise<TrendsResponse> => {
    const { checkins } = await store.read();
    return buildInsights(checkins, parseDate(today, 'today'), parseRange(range));
  },

  // ---- Data management ----
  /** Replaces everything with about 30 days of sample data ending yesterday. */
  loadSampleData: async (today: IsoDate): Promise<void> => {
    const sample = buildSampleData(parseDate(today, 'today'));
    await store.update((db) => {
      Object.assign(db, sample);
    });
  },
  /** Deletes all check-ins, journal entries, and feedback stored in this browser. */
  clearAllData: async (): Promise<void> => {
    await store.update((db) => {
      Object.assign(db, emptyDb());
    });
  },
};
