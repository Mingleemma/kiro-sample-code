import { useEffect, useState, type FormEvent } from 'react';
import type { IsoDate, Mood } from '@wellbeing/shared';
import { api } from '../api/client';
import { useResource } from '../hooks/useResource';
import { formatDay } from '../lib/dates';
import { moodLabel } from '../lib/moods';
import { MoodPicker } from './MoodPicker';
import { ErrorMessage, Loading } from './Status';

const NOTE_MAX = 500;

export function CheckInCard({ today, onSaved }: { today: IsoDate; onSaved: () => void }) {
  const existing = useResource(() => api.listCheckins(today, today).then((list) => list[0]), [today]);
  const [mood, setMood] = useState<Mood | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>();
  const [savedMessage, setSavedMessage] = useState<string>();

  // Pre-fill the form with today's saved check-in.
  useEffect(() => {
    if (existing.data) {
      setMood(existing.data.mood);
      setNote(existing.data.note ?? '');
    }
  }, [existing.data]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (mood === null) {
      setSaveError('Pick a mood first.');
      return;
    }
    setSaving(true);
    setSaveError(undefined);
    setSavedMessage(undefined);
    try {
      await api.saveCheckin(today, mood, note);
      setSavedMessage(existing.data ? 'Check-in updated.' : 'Check-in saved. Thanks for checking in!');
      existing.reload();
      onSaved();
    } catch (err) {
      setSaveError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="card" aria-labelledby="checkin-title">
      <div className="card-head">
        <h2 id="checkin-title">Daily check-in</h2>
        <span className="muted">{formatDay(today)}</span>
      </div>

      {existing.loading && !existing.data && <Loading />}
      {existing.error && <ErrorMessage message={existing.error} onRetry={existing.reload} />}

      {!existing.error && (
        <form onSubmit={submit} className="stack">
          {existing.data && (
            <p className="notice">
              You already checked in today ({existing.data.mood} · {moodLabel(existing.data.mood)}). You
              can update it below.
            </p>
          )}
          <MoodPicker value={mood} onChange={setMood} disabled={saving} />
          <div className="field">
            <label htmlFor="checkin-note">Note (optional)</label>
            <textarea
              id="checkin-note"
              rows={2}
              maxLength={NOTE_MAX}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Anything on your mind?"
              disabled={saving}
            />
            <span className="hint">
              {note.length}/{NOTE_MAX}
            </span>
          </div>
          {saveError && <ErrorMessage message={saveError} />}
          {savedMessage && (
            <p className="success" role="status">
              {savedMessage}
            </p>
          )}
          <div>
            <button type="submit" className="btn btn-primary" disabled={saving || mood === null}>
              {saving ? 'Saving…' : existing.data ? 'Update check-in' : 'Save check-in'}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
