// Types shared by server and client. Type-only: always use `import type`.

/** Calendar date in local time, formatted YYYY-MM-DD. */
export type IsoDate = string;

export type Mood = 1 | 2 | 3 | 4 | 5;

export interface CheckIn {
  date: IsoDate;
  mood: Mood;
  note?: string;
  updatedAt: string;
}

export interface JournalEntry {
  id: string;
  createdAt: string;
  updatedAt: string;
  text: string;
}

export type Verdict = 'helpful' | 'not_for_me';

export interface Feedback {
  itemId: string;
  verdict: Verdict;
  at: string;
}

export interface DbSchema {
  version: 1;
  checkins: CheckIn[];
  journal: JournalEntry[];
  feedback: Feedback[];
}

// ---- Burnout / stress indicator ----

export type IndicatorLevel = 'low' | 'moderate' | 'high';

export type SignalId = 'low_streak' | 'declining_trend' | 'missed_checkins';

export interface Signal {
  id: SignalId;
  message: string;
}

export interface IndicatorResult {
  evaluatedOn: IsoDate;
  level: IndicatorLevel;
  signals: Signal[];
  /** False when there are no check-ins yet, so the level is not meaningful. */
  hasData: boolean;
}

// ---- Recommendations ----

export type Category = 'mindfulness' | 'exercise' | 'self-care';

/** low = mood 1-2, mid = mood 3, high = mood 4-5 */
export type MoodBand = 'low' | 'mid' | 'high';

export interface CatalogItem {
  id: string;
  title: string;
  description: string;
  category: Category;
  durationMinutes: number;
  moodBands: MoodBand[];
  indicatorLevels: IndicatorLevel[];
}

export interface Recommendation extends CatalogItem {
  verdict?: Verdict;
  reason: string;
}

export interface RecommendationsResponse {
  date: IsoDate;
  /** Null when the user has not checked in today. */
  moodBand: MoodBand | null;
  level: IndicatorLevel;
  items: Recommendation[];
}

// ---- Trends ----

export type TrendRange = 7 | 30;

export interface TrendPoint {
  date: IsoDate;
  mood: number | null;
}

export interface TrendsResponse {
  range: TrendRange;
  series: TrendPoint[];
  average: number | null;
  checkInCount: number;
  currentStreak: number;
  longestStreak: number;
  insights: string[];
}

export interface ApiError {
  error: string;
}
