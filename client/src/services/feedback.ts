import type { Feedback, Verdict } from '@wellbeing/shared';
import type { Store } from '../store/localStore';

/** Keeps one verdict per item; a new verdict replaces the old one. */
export function setFeedback(store: Store, itemId: string, verdict: Verdict): Promise<Feedback> {
  return store.update((db) => {
    const feedback: Feedback = { itemId, verdict, at: new Date().toISOString() };
    db.feedback = db.feedback.filter((f) => f.itemId !== itemId);
    db.feedback.push(feedback);
    return feedback;
  });
}

export function clearFeedback(store: Store, itemId: string): Promise<void> {
  return store.update((db) => {
    db.feedback = db.feedback.filter((f) => f.itemId !== itemId);
  });
}
