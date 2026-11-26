import { useState } from 'react';
import type { IsoDate, Recommendation, Verdict } from '@wellbeing/shared';
import { api } from '../api/client';
import { useResource } from '../hooks/useResource';
import { ErrorMessage, Loading } from './Status';

const CATEGORY_LABEL: Record<Recommendation['category'], string> = {
  mindfulness: 'Mindfulness',
  exercise: 'Exercise',
  'self-care': 'Self-care',
};

export function RecommendationsCard({ today, refreshKey }: { today: IsoDate; refreshKey: number }) {
  const recs = useResource(() => api.recommendations(today), [today, refreshKey]);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string>();
  // The last item hidden with "Not for me", so it can be undone.
  const [hidden, setHidden] = useState<{ id: string; title: string }>();

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setActionError(undefined);
    try {
      await action();
      recs.reload();
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function respond(item: Recommendation, verdict: Verdict) {
    return run(async () => {
      if (item.verdict === verdict) {
        await api.clearFeedback(item.id);
        return;
      }
      await api.setFeedback(item.id, verdict);
      setHidden(verdict === 'not_for_me' ? { id: item.id, title: item.title } : undefined);
    });
  }

  function undoHide() {
    if (!hidden) return;
    const { id } = hidden;
    return run(async () => {
      await api.clearFeedback(id);
      setHidden(undefined);
    });
  }

  const data = recs.data;

  return (
    <section className="card" aria-labelledby="recs-title">
      <div className="card-head">
        <h2 id="recs-title">Suggestions for today</h2>
      </div>

      {recs.loading && !data && <Loading />}
      {recs.error && <ErrorMessage message={recs.error} onRetry={recs.reload} />}
      {actionError && <ErrorMessage message={actionError} />}
      {hidden && (
        <div className="notice notice-row" role="status">
          <span>Got it. We won't suggest "{hidden.title}" again.</span>
          <button type="button" className="btn btn-small" onClick={undoHide} disabled={busy}>
            Undo
          </button>
        </div>
      )}

      {data && data.moodBand === null && (
        <p className="muted">Check in today to get suggestions matched to your mood.</p>
      )}

      {data && data.items.length === 0 && (
        <p className="muted">You've marked every suggestion as "Not for me".</p>
      )}

      {data && data.items.length > 0 && (
        <ul className="recs">
          {data.items.map((item) => (
            <li key={item.id} className="rec">
              <div className="rec-head">
                <h3>{item.title}</h3>
                <span className={`tag tag-${item.category}`}>
                  {CATEGORY_LABEL[item.category]} · {item.durationMinutes} min
                </span>
              </div>
              <p>{item.description}</p>
              <p className="hint">{item.reason}</p>
              <div className="rec-actions">
                <button
                  type="button"
                  className="btn btn-small"
                  aria-pressed={item.verdict === 'helpful'}
                  disabled={busy}
                  onClick={() => respond(item, 'helpful')}
                >
                  👍 {item.verdict === 'helpful' ? 'Helpful (undo)' : 'Helpful'}
                </button>
                <button
                  type="button"
                  className="btn btn-small btn-quiet"
                  disabled={busy}
                  onClick={() => respond(item, 'not_for_me')}
                >
                  Not for me
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
