// Generates ~30 days of sample data for demos.
//   npm run seed            -> only seeds when there is no existing data
//   npm run seed -- --force -> replaces existing data
//
// The story: a steady few weeks, then a slide over the last week ending in
// three low days. Today is left empty so the demo can start with a check-in.

import { randomUUID } from 'node:crypto';
import type { CheckIn, JournalEntry, Mood } from '@wellbeing/shared';
import { DATA_FILE } from '../config.js';
import { addDays, localToday } from '../domain/dates.js';
import { createJsonStore, emptyDb } from '../store/jsonStore.js';

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

async function main() {
  const force = process.argv.includes('--force');
  const store = createJsonStore(DATA_FILE);
  const current = await store.read();
  const hasData = current.checkins.length + current.journal.length + current.feedback.length > 0;
  if (hasData && !force) {
    console.log(`Data already exists in ${DATA_FILE}.`);
    console.log('Run "npm run seed -- --force" to replace it with sample data.');
    return;
  }

  const today = localToday();
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
    return { id: randomUUID(), createdAt: at, updatedAt: at, text };
  });

  await store.update((db) => {
    Object.assign(db, emptyDb(), { checkins, journal });
  });

  console.log(`Seeded ${checkins.length} check-ins and ${journal.length} journal entries into ${DATA_FILE}.`);
  console.log('Today is left empty so you can check in during the demo.');
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
