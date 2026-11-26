import type { IsoDate } from '@wellbeing/shared';

// Dates are calendar days (YYYY-MM-DD). Arithmetic uses UTC midnight so
// daylight-saving changes never shift a day.

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

function toUtc(date: IsoDate): Date {
  return new Date(`${date}T00:00:00Z`);
}

export function isIsoDate(value: string): boolean {
  if (!DATE_RE.test(value)) return false;
  const d = toUtc(value);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

export function addDays(date: IsoDate, days: number): IsoDate {
  const d = toUtc(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** `count` consecutive days ending on `end`, oldest first. */
export function dayRange(end: IsoDate, count: number): IsoDate[] {
  return Array.from({ length: count }, (_, i) => addDays(end, i - (count - 1)));
}

export function weekdayOf(date: IsoDate): number {
  return toUtc(date).getUTCDay();
}

/** Today's date in the server's local time zone. */
export function localToday(now = new Date()): IsoDate {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function round1(value: number): number {
  return Math.round(value * 10) / 10;
}
