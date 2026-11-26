import type { CheckIn, IsoDate, TrendRange, TrendsResponse } from '@wellbeing/shared';
import { addDays, average, dayRange, round1, weekdayOf, WEEKDAYS } from './dates.js';
import { LOW_MOOD_MAX } from './indicators.js';

const SAME_THRESHOLD = 0.2;
const WEEKDAY_LOOKBACK_DAYS = 30;
const WEEKDAY_MIN_CHECKINS = 7;
const WEEKDAY_MIN_GAP = 0.5;

/**
 * Builds the trend series, streaks, and plain-language insights. Pure function.
 */
export function buildInsights(
  checkins: CheckIn[],
  today: IsoDate,
  range: TrendRange,
): TrendsResponse {
  const moods = new Map<IsoDate, number>();
  for (const c of checkins) if (c.date <= today) moods.set(c.date, c.mood);

  const series = dayRange(today, range).map((date) => ({ date, mood: moods.get(date) ?? null }));
  const inWindow = series.flatMap((p) => (p.mood === null ? [] : [p.mood]));
  const avg = average(inWindow);
  const currentStreak = currentCheckInStreak(moods, today);
  const longestStreak = longestCheckInStreak([...moods.keys()]);

  const insights: string[] = [];

  if (avg === null) {
    insights.push(
      `No check-ins in the last ${range} days yet. Your next check-in starts the chart.`,
    );
  } else {
    insights.push(
      `Your average mood over the last ${range} days is ${round1(avg)}/5, from ${inWindow.length} check-in${plural(inWindow.length)}.`,
    );

    const prevAvg = average(
      dayRange(addDays(today, -range), range).flatMap((d) => {
        const m = moods.get(d);
        return m === undefined ? [] : [m];
      }),
    );
    if (prevAvg !== null) {
      const diff = avg - prevAvg;
      if (Math.abs(diff) < SAME_THRESHOLD) {
        insights.push(`That's about the same as the ${range} days before.`);
      } else {
        const pct = Math.round((Math.abs(diff) / prevAvg) * 100);
        const points = round1(Math.abs(diff));
        insights.push(
          `That's ${diff > 0 ? 'up' : 'down'} ${points} point${plural(points)} (${pct}%) from the ${range} days before.`,
        );
      }
    }

    const lowDays = inWindow.filter((m) => m <= LOW_MOOD_MAX).length;
    if (lowDays > 0) {
      insights.push(
        `${lowDays} of your ${inWindow.length} check-ins in this period were low (${LOW_MOOD_MAX} or below).`,
      );
    }
  }

  const weekday = weekdayPattern(moods, today);
  if (weekday) insights.push(weekday);

  if (currentStreak >= 2) {
    insights.push(`You're on a ${currentStreak}-day check-in streak. Keep it going!`);
  }
  if (longestStreak >= 3 && longestStreak > currentStreak) {
    insights.push(`Your longest check-in streak so far is ${longestStreak} days.`);
  }

  return {
    range,
    series,
    average: avg === null ? null : round1(avg),
    checkInCount: inWindow.length,
    currentStreak,
    longestStreak,
    insights,
  };
}

/** Consecutive days with a check-in, ending today (or yesterday if today is still open). */
export function currentCheckInStreak(moods: Map<IsoDate, number>, today: IsoDate): number {
  let day = moods.has(today) ? today : addDays(today, -1);
  let count = 0;
  while (moods.has(day)) {
    count++;
    day = addDays(day, -1);
  }
  return count;
}

export function longestCheckInStreak(dates: IsoDate[]): number {
  const sorted = [...new Set(dates)].sort();
  let longest = 0;
  let run = 0;
  let prev: IsoDate | null = null;
  for (const d of sorted) {
    run = prev !== null && addDays(prev, 1) === d ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = d;
  }
  return longest;
}

function weekdayPattern(moods: Map<IsoDate, number>, today: IsoDate): string | null {
  const byDay: number[][] = WEEKDAYS.map(() => []);
  let total = 0;
  for (const d of dayRange(today, WEEKDAY_LOOKBACK_DAYS)) {
    const m = moods.get(d);
    if (m === undefined) continue;
    byDay[weekdayOf(d)]!.push(m);
    total++;
  }
  if (total < WEEKDAY_MIN_CHECKINS) return null;

  const avgs = byDay
    .map((values, day) => ({ day, avg: average(values) }))
    .filter((x): x is { day: number; avg: number } => x.avg !== null);
  if (avgs.length < 3) return null;

  const best = avgs.reduce((a, b) => (b.avg > a.avg ? b : a));
  const worst = avgs.reduce((a, b) => (b.avg < a.avg ? b : a));
  if (best.avg - worst.avg < WEEKDAY_MIN_GAP) return null;

  return `Over the last ${WEEKDAY_LOOKBACK_DAYS} days, your mood tends to be highest on ${WEEKDAYS[best.day]}s (${round1(best.avg)}) and lowest on ${WEEKDAYS[worst.day]}s (${round1(worst.avg)}).`;
}

function plural(n: number): string {
  return n === 1 ? '' : 's';
}
