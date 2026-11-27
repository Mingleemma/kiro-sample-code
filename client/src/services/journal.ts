import type { JournalEntry } from '@wellbeing/shared';
import { newId } from '../lib/ids';
import type { Store } from '../store/localStore';

const NOT_FOUND = 'That journal entry no longer exists. It may have been deleted in another tab.';

export async function listEntries(store: Store): Promise<JournalEntry[]> {
  const { journal } = await store.read();
  return [...journal].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function createEntry(store: Store, text: string): Promise<JournalEntry> {
  return store.update((db) => {
    const now = new Date().toISOString();
    const entry: JournalEntry = { id: newId(), createdAt: now, updatedAt: now, text };
    db.journal.push(entry);
    return entry;
  });
}

export function updateEntry(store: Store, id: string, text: string): Promise<JournalEntry> {
  return store.update((db) => {
    const entry = db.journal.find((e) => e.id === id);
    if (!entry) throw new Error(NOT_FOUND);
    entry.text = text;
    entry.updatedAt = new Date().toISOString();
    return entry;
  });
}

export function deleteEntry(store: Store, id: string): Promise<void> {
  return store.update((db) => {
    const index = db.journal.findIndex((e) => e.id === id);
    if (index < 0) throw new Error(NOT_FOUND);
    db.journal.splice(index, 1);
  });
}
