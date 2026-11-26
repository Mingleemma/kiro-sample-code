import { useState, type FormEvent } from 'react';
import type { JournalEntry } from '@wellbeing/shared';
import { api } from '../api/client';
import { ErrorMessage, Loading } from '../components/Status';
import { useResource } from '../hooks/useResource';
import { formatTimestamp } from '../lib/dates';

const JOURNAL_MAX = 5000;

export function JournalPage() {
  const entries = useResource(() => api.listJournal(), []);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  async function create(e: FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setSaving(true);
    setError(undefined);
    try {
      await api.createJournal(draft);
      setDraft('');
      entries.reload();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="stack-lg">
      <h1 className="page-title">Journal</h1>

      <section className="card" aria-labelledby="new-entry-title">
        <h2 id="new-entry-title">New entry</h2>
        <form onSubmit={create} className="stack">
          <div className="field">
            <label htmlFor="journal-new">What's on your mind?</label>
            <textarea
              id="journal-new"
              rows={5}
              maxLength={JOURNAL_MAX}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write freely. Only you can see this."
              disabled={saving}
            />
            <span className="hint">
              {draft.length}/{JOURNAL_MAX}
            </span>
          </div>
          {error && <ErrorMessage message={error} />}
          <div>
            <button type="submit" className="btn btn-primary" disabled={saving || !draft.trim()}>
              {saving ? 'Saving…' : 'Save entry'}
            </button>
          </div>
        </form>
      </section>

      <section aria-labelledby="entries-title" className="stack">
        <h2 id="entries-title">Past entries</h2>
        {entries.loading && !entries.data && <Loading />}
        {entries.error && <ErrorMessage message={entries.error} onRetry={entries.reload} />}
        {entries.data?.length === 0 && <p className="muted">No entries yet. Your first one will show up here.</p>}
        {entries.data?.map((entry) => (
          <EntryCard key={entry.id} entry={entry} onChanged={entries.reload} />
        ))}
      </section>
    </div>
  );
}

function EntryCard({ entry, onChanged }: { entry: JournalEntry; onChanged: () => void }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(entry.text);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  async function act(action: () => Promise<unknown>, after?: () => void) {
    setBusy(true);
    setError(undefined);
    try {
      await action();
      after?.();
      onChanged();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function save(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    act(() => api.updateJournal(entry.id, text), () => setEditing(false));
  }

  function remove() {
    if (!window.confirm('Delete this journal entry? This cannot be undone.')) return;
    act(() => api.deleteJournal(entry.id));
  }

  const edited = entry.updatedAt !== entry.createdAt;

  return (
    <article className="card entry">
      <header className="card-head">
        <time dateTime={entry.createdAt} className="muted">
          {formatTimestamp(entry.createdAt)}
          {edited && ' (edited)'}
        </time>
        {!editing && (
          <div className="rec-actions">
            <button
              type="button"
              className="btn btn-small"
              onClick={() => {
                setText(entry.text);
                setEditing(true);
              }}
              disabled={busy}
            >
              Edit
            </button>
            <button type="button" className="btn btn-small btn-danger" onClick={remove} disabled={busy}>
              Delete
            </button>
          </div>
        )}
      </header>

      {editing ? (
        <form onSubmit={save} className="stack">
          <label className="sr-only" htmlFor={`edit-${entry.id}`}>
            Edit entry
          </label>
          <textarea
            id={`edit-${entry.id}`}
            rows={5}
            maxLength={JOURNAL_MAX}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={busy}
            autoFocus
          />
          <div className="rec-actions">
            <button type="submit" className="btn btn-primary btn-small" disabled={busy || !text.trim()}>
              Save
            </button>
            <button type="button" className="btn btn-small btn-quiet" onClick={() => setEditing(false)} disabled={busy}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <p className="entry-text">{entry.text}</p>
      )}
      {error && <ErrorMessage message={error} />}
    </article>
  );
}
