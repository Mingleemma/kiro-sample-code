import { randomUUID } from 'node:crypto';
import type { JournalEntry } from '@wellbeing/shared';
import { HttpError } from '../http.js';
import type { Store } from '../store/jsonStore.js';

export async function listEntries(store: Store): Promise<JournalEntry[]> {
  const { journal } = await store.read();
  return [...journal].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function createEntry(store: Store, text: string): Promise<JournalEntry> {
  return store.update((db) => {
    const now = new Date().toISOString();
    const entry: JournalEntry = { id: randomUUID(), createdAt: now, updatedAt: now, text };
    db.journal.push(entry);
    return entry;
  });
}

export function updateEntry(store: Store, id: string, text: string): Promise<JournalEntry> {
  return store.update((db) => {
    const entry = db.journal.find((e) => e.id === id);
    if (!entry) throw new HttpError(404, 'Journal entry not found.');
    entry.text = text;
    entry.updatedAt = new Date().toISOString();
    return entry;
  });
}

export function deleteEntry(store: Store, id: string): Promise<void> {
  return store.update((db) => {
    const index = db.journal.findIndex((e) => e.id === id);
    if (index < 0) throw new HttpError(404, 'Journal entry not found.');
    db.journal.splice(index, 1);
  });
}
