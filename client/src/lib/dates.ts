import type { IsoDate } from '@wellbeing/shared';

/** Today's date in the browser's local time zone (YYYY-MM-DD). */
export function localToday(now = new Date()): IsoDate {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function fromIso(date: IsoDate): Date {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y!, m! - 1, d!);
}

/** "Thu, Nov 26" */
export function formatDay(date: IsoDate): string {
  return fromIso(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

/** "Nov 26" */
export function formatShortDay(date: IsoDate): string {
  return fromIso(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/** "Nov 26, 2026, 9:30 PM" */
export function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}
