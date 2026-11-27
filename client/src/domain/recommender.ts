import type {
  CatalogItem,
  Feedback,
  IndicatorLevel,
  IsoDate,
  Mood,
  MoodBand,
  Recommendation,
  Verdict,
} from '@wellbeing/shared';

export const DEFAULT_LIMIT = 3;
const MAX_PER_CATEGORY = 2;

// Scoring weights. A "helpful" boost ranks an item higher, but an item that
// fits both mood and stress level still beats a helpful item that fits neither.
const BAND_MATCH = 2;
const LEVEL_MATCH = 2;
const HELPFUL_BOOST = 3;

export function moodBandFor(mood: Mood): MoodBand {
  if (mood <= 2) return 'low';
  if (mood === 3) return 'mid';
  return 'high';
}

interface Scored {
  item: CatalogItem;
  score: number;
  tiebreak: number;
  bandMatch: boolean;
  levelMatch: boolean;
  helpful: boolean;
}

/**
 * Picks daily recommendations. Pure function.
 *  - Items marked "not for me" are never returned.
 *  - Score = mood band match + indicator level match + "helpful" boost.
 *  - Ties are broken with a hash of the date, so picks are stable within a
 *    day and vary across days.
 *  - At most 2 items per category, so the picks stay varied.
 * `mood` is null when the user has not checked in today; then every band matches.
 */
export function recommend(
  catalog: CatalogItem[],
  mood: Mood | null,
  level: IndicatorLevel,
  feedback: Feedback[],
  date: IsoDate,
  limit = DEFAULT_LIMIT,
): Recommendation[] {
  const verdicts = latestVerdicts(feedback);
  const band = mood === null ? null : moodBandFor(mood);

  const scored: Scored[] = catalog
    .filter((item) => verdicts.get(item.id) !== 'not_for_me')
    .map((item) => {
      const bandMatch = band === null || item.moodBands.includes(band);
      const levelMatch = item.indicatorLevels.includes(level);
      const helpful = verdicts.get(item.id) === 'helpful';
      const score =
        (bandMatch ? BAND_MATCH : 0) + (levelMatch ? LEVEL_MATCH : 0) + (helpful ? HELPFUL_BOOST : 0);
      return { item, score, tiebreak: hash(`${date}:${item.id}`), bandMatch, levelMatch, helpful };
    })
    .sort((a, b) => b.score - a.score || a.tiebreak - b.tiebreak);

  const picked: Scored[] = [];
  const perCategory = new Map<string, number>();
  for (const s of scored) {
    if (picked.length >= limit) break;
    const count = perCategory.get(s.item.category) ?? 0;
    if (count >= MAX_PER_CATEGORY) continue;
    picked.push(s);
    perCategory.set(s.item.category, count + 1);
  }
  // If the category cap left gaps, fill them with the next best items.
  for (const s of scored) {
    if (picked.length >= limit) break;
    if (!picked.includes(s)) picked.push(s);
  }

  return picked.map((s) => ({
    ...s.item,
    verdict: verdicts.get(s.item.id),
    reason: reasonFor(s, band, level),
  }));
}

function latestVerdicts(feedback: Feedback[]): Map<string, Verdict> {
  const sorted = [...feedback].sort((a, b) => a.at.localeCompare(b.at));
  return new Map(sorted.map((f) => [f.itemId, f.verdict]));
}

function reasonFor(s: Scored, band: MoodBand | null, level: IndicatorLevel): string {
  const parts: string[] = [];
  if (s.helpful) parts.push('You found this helpful before');
  if (band !== null && s.bandMatch) parts.push(`Suited to a ${band} mood`);
  if (s.levelMatch) parts.push(`Fits a ${level} stress level`);
  return parts.length > 0 ? parts.join(' · ') : 'Something different to try';
}

// FNV-1a 32-bit hash: small, deterministic, good enough for tie-breaking.
function hash(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
