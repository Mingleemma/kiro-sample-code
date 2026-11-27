// Sample data for demos, loaded from the "Load sample data" button.
//
// The story: a steady few weeks, then a slide over the last week ending in
// three low days. Today is left empty so the demo can start with a check-in.

import type { CheckIn, DbSchema, IsoDate, JournalEntry, Mood } from '@wellbeing/shared';
import { addDays } from '../domain/dates';
import { newId } from '../lib/ids';

// Mood for each day, oldest first, ending yesterday. 0 = no check-in that day.
const MOODS: (Mood | 0)[] = [
  4, 3, 4, 5, 4, 3, 0, 4, 4, 3, 5, 4, 3, 4, // weeks 1-2: mostly good
  4, 3, 4, 3, 4, 0, 4, 3, //                  week 3: steady
  3, 3, 2, 0, 2, 2, 1, //                     last week: sliding, 3 low days to finish
];

const NOTES: Record<number, string> = {
  3: 'Great run this morning and a calm day at work.',
  10: 'Weekend with friends, felt recharged.',
  24: 'Deadlines are piling up.',
  27: 'Slept badly, everything felt heavy.',
  28: 'Skipped lunch again. Need a break.',
};

const JOURNAL: { daysAgo: number; text: string }[] = [
  {
    daysAgo: 27,
    text: 'Starting this journal to keep track of how I feel. Work is busy but manageable, and I have been keeping up with morning walks.',
  },
  {
    daysAgo: 20,
    text: 'Lovely weekend. Cooked a big meal with friends and laughed a lot. I want to make time for this more often.',
  },
  {
    daysAgo: 13,
    text: 'A new project landed today. Excited, but I can already feel the to-do list growing faster than I can clear it.',
  },
  {
    daysAgo: 6,
    text: 'Long day. Answered emails until late and skipped my walk. Noticing I am more irritable than usual.',
  },
  {
    daysAgo: 3,
    text: 'Felt overwhelmed. Too many meetings, not enough focus time. I should talk to my manager about priorities.',
  },
  {
    daysAgo: 1,
    text: 'Low energy all day. Going to try an early night and a screen-free evening.',
  },
];

/** Builds about 30 days of sample data ending the day before `today`. */
export function buildSampleData(today: IsoDate): DbSchema {
  const checkins: CheckIn[] = [];
  MOODS.forEach((mood, i) => {
    if (mood === 0) return;
    const date = addDays(today, i - MOODS.length);
    const checkin: CheckIn = { date, mood, updatedAt: `${date}T20:00:00.000Z` };
    if (NOTES[i]) checkin.note = NOTES[i];
    checkins.push(checkin);
  });

  const journal: JournalEntry[] = JOURNAL.map(({ daysAgo, text }) => {
    const at = `${addDays(today, -daysAgo)}T21:30:00.000Z`;
    return { id: newId(), createdAt: at, updatedAt: at, text };
  });

  return { version: 1, checkins, journal, feedback: [] };
}
