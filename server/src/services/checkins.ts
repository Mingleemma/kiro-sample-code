import type { CheckIn, IsoDate, Mood } from '@wellbeing/shared';
import type { Store } from '../store/jsonStore.js';

export async function listCheckins(store: Store, from?: IsoDate, to?: IsoDate): Promise<CheckIn[]> {
  const { checkins } = await store.read();
  return checkins
    .filter((c) => (from === undefined || c.date >= from) && (to === undefined || c.date <= to))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** One check-in per day: a second save on the same date replaces the first. */
export function upsertCheckin(
  store: Store,
  date: IsoDate,
  mood: Mood,
  note: string | undefined,
): Promise<{ checkin: CheckIn; created: boolean }> {
  return store.update((db) => {
    const checkin: CheckIn = { date, mood, updatedAt: new Date().toISOString() };
    if (note) checkin.note = note;
    const index = db.checkins.findIndex((c) => c.date === date);
    if (index >= 0) db.checkins[index] = checkin;
    else db.checkins.push(checkin);
    return { checkin, created: index < 0 };
  });
}
