import type {
  CheckIn,
  IndicatorLevel,
  IndicatorResult,
  IsoDate,
  Mood,
  Signal,
} from '@wellbeing/shared';
import { addDays, average, dayRange, round1 } from './dates.js';

// Rule thresholds. Kept as named constants so they are easy to explain and tune.
export const LOW_MOOD_MAX = 2;
export const LOW_STREAK_DAYS = 3;
export const WINDOW_DAYS = 7;
export const DECLINE_THRESHOLD = 0.5;
export const MIN_CHECKINS_PER_WINDOW = 3;
export const MISSED_DAYS_THRESHOLD = 3;

/**
 * Rule-based burnout/stress indicator using mood check-ins only.
 * Pure function: same input, same output. No I/O.
 *
 * Signals:
 *  - low_streak:      mood <= 2 on 3+ consecutive days (ending today, or yesterday
 *                     if today has no check-in yet)
 *  - declining_trend: average mood over the last 7 days is at least 0.5 lower than
 *                     the 7 days before (needs 3+ check-ins in each window)
 *  - missed_checkins: no check-in on 3+ of the previous 7 days (today excluded;
 *                     days before the first ever check-in are not counted)
 *
 * Level: 0 signals = low, 1 = moderate, 2+ = high.
 */
export function evaluateIndicators(checkins: CheckIn[], today: IsoDate): IndicatorResult {
  const moods = new Map<IsoDate, Mood>();
  for (const c of checkins) if (c.date <= today) moods.set(c.date, c.mood);

  if (moods.size === 0) {
    return { evaluatedOn: today, level: 'low', signals: [], hasData: false };
  }

  const signals: Signal[] = [];

  const streak = lowMoodStreak(moods, today);
  if (streak >= LOW_STREAK_DAYS) {
    signals.push({
      id: 'low_streak',
      message: `Your mood has been ${LOW_MOOD_MAX} or below for ${streak} days in a row.`,
    });
  }

  const recent = windowMoods(moods, today);
  const prior = windowMoods(moods, addDays(today, -WINDOW_DAYS));
  if (recent.length >= MIN_CHECKINS_PER_WINDOW && prior.length >= MIN_CHECKINS_PER_WINDOW) {
    const recentAvg = average(recent)!;
    const priorAvg = average(prior)!;
    const drop = Math.round((priorAvg - recentAvg) * 100) / 100;
    if (drop >= DECLINE_THRESHOLD) {
      signals.push({
        id: 'declining_trend',
        message: `Your average mood this week (${round1(recentAvg)}) is ${round1(drop)} lower than the week before (${round1(priorAvg)}).`,
      });
    }
  }

  const missed = missedCheckIns(moods, today);
  if (missed >= MISSED_DAYS_THRESHOLD) {
    signals.push({
      id: 'missed_checkins',
      message: `You skipped check-ins on ${missed} of the last ${WINDOW_DAYS} days. Gaps can be a sign of feeling stretched.`,
    });
  }

  return { evaluatedOn: today, level: levelFor(signals.length), signals, hasData: true };
}

export function levelFor(signalCount: number): IndicatorLevel {
  if (signalCount >= 2) return 'high';
  if (signalCount === 1) return 'moderate';
  return 'low';
}

function lowMoodStreak(moods: Map<IsoDate, Mood>, today: IsoDate): number {
  let day = moods.has(today) ? today : addDays(today, -1);
  let count = 0;
  while ((moods.get(day) ?? Infinity) <= LOW_MOOD_MAX) {
    count++;
    day = addDays(day, -1);
  }
  return count;
}

function windowMoods(moods: Map<IsoDate, Mood>, end: IsoDate): number[] {
  return dayRange(end, WINDOW_DAYS)
    .map((d) => moods.get(d))
    .filter((m): m is Mood => m !== undefined);
}

function missedCheckIns(moods: Map<IsoDate, Mood>, today: IsoDate): number {
  const firstDate = [...moods.keys()].sort()[0]!;
  return dayRange(addDays(today, -1), WINDOW_DAYS).filter(
    (d) => d >= firstDate && !moods.has(d),
  ).length;
}
