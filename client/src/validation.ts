import type { IsoDate, Mood, TrendRange, Verdict } from '@wellbeing/shared';
import { isIsoDate } from './domain/dates';

/** Thrown for invalid input. The message is shown to the user as is. */
export class ValidationError extends Error {}

export const NOTE_MAX = 500;
export const JOURNAL_MAX = 5000;

export function parseDate(value: unknown, name: string): IsoDate {
  if (typeof value !== 'string' || !isIsoDate(value)) {
    throw new ValidationError(`${name} must be a date in YYYY-MM-DD format.`);
  }
  return value;
}

export function parseMood(value: unknown): Mood {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > 5) {
    throw new ValidationError('Mood must be a whole number from 1 to 5.');
  }
  return value as Mood;
}

export function parseText(
  value: unknown,
  opts: { name: string; max: number; required: boolean },
): string | undefined {
  if (value === undefined || value === null) {
    if (opts.required) throw new ValidationError(`${opts.name} is required.`);
    return undefined;
  }
  if (typeof value !== 'string') throw new ValidationError(`${opts.name} must be text.`);
  const text = value.trim();
  if (text.length === 0) {
    if (opts.required) throw new ValidationError(`${opts.name} cannot be empty.`);
    return undefined;
  }
  if (text.length > opts.max) {
    throw new ValidationError(`${opts.name} must be ${opts.max} characters or fewer.`);
  }
  return text;
}

export function parseVerdict(value: unknown): Verdict {
  if (value !== 'helpful' && value !== 'not_for_me') {
    throw new ValidationError('Feedback must be "helpful" or "not_for_me".');
  }
  return value;
}

export function parseRange(value: unknown): TrendRange {
  if (value === 7 || value === 30) return value;
  throw new ValidationError('Range must be 7 or 30 days.');
}
