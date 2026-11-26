import type { IsoDate, Mood, TrendRange, Verdict } from '@wellbeing/shared';
import { addDays, isIsoDate, localToday } from './domain/dates.js';
import { HttpError } from './http.js';

export function parseDate(value: unknown, name: string): IsoDate {
  if (typeof value !== 'string' || !isIsoDate(value)) {
    throw new HttpError(400, `${name} must be a date in YYYY-MM-DD format.`);
  }
  return value;
}

export function parseOptionalDate(value: unknown, name: string): IsoDate | undefined {
  return value === undefined || value === '' ? undefined : parseDate(value, name);
}

/**
 * The client sends its local "today" so rules match the user's time zone.
 * Values more than a day away from the server's date are rejected.
 */
export function parseToday(value: unknown): IsoDate {
  const serverToday = localToday();
  if (value === undefined || value === '') return serverToday;
  const today = parseDate(value, 'today');
  if (today < addDays(serverToday, -1) || today > addDays(serverToday, 1)) {
    throw new HttpError(400, 'today is too far from the current date.');
  }
  return today;
}

export function parseCheckInDate(value: unknown): IsoDate {
  const date = parseDate(value, 'date');
  if (date > addDays(localToday(), 1)) {
    throw new HttpError(400, 'You cannot check in for a future date.');
  }
  return date;
}

export function parseMood(value: unknown): Mood {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > 5) {
    throw new HttpError(400, 'mood must be a whole number from 1 to 5.');
  }
  return value as Mood;
}

export function parseText(
  value: unknown,
  opts: { name: string; max: number; required: boolean },
): string | undefined {
  if (value === undefined || value === null) {
    if (opts.required) throw new HttpError(400, `${opts.name} is required.`);
    return undefined;
  }
  if (typeof value !== 'string') throw new HttpError(400, `${opts.name} must be text.`);
  const text = value.trim();
  if (text.length === 0) {
    if (opts.required) throw new HttpError(400, `${opts.name} cannot be empty.`);
    return undefined;
  }
  if (text.length > opts.max) {
    throw new HttpError(400, `${opts.name} must be ${opts.max} characters or fewer.`);
  }
  return text;
}

export function parseVerdict(value: unknown): Verdict {
  if (value !== 'helpful' && value !== 'not_for_me') {
    throw new HttpError(400, 'verdict must be "helpful" or "not_for_me".');
  }
  return value;
}

export function parseRange(value: unknown): TrendRange {
  if (value === undefined || value === '' || value === '7') return 7;
  if (value === '30') return 30;
  throw new HttpError(400, 'range must be 7 or 30.');
}
