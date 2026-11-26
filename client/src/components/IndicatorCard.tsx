import type { IndicatorLevel, IsoDate } from '@wellbeing/shared';
import { api } from '../api/client';
import { useResource } from '../hooks/useResource';
import { ErrorMessage, Loading } from './Status';

const LEVEL_TEXT: Record<IndicatorLevel, { label: string; summary: string }> = {
  low: { label: 'Low', summary: 'No stress signals right now. Nice work looking after yourself.' },
  moderate: { label: 'Moderate', summary: 'One stress signal showed up. Worth a little extra care.' },
  high: { label: 'High', summary: 'Several stress signals showed up. Consider slowing down and resting.' },
};

export function IndicatorCard({ today, refreshKey }: { today: IsoDate; refreshKey: number }) {
  const result = useResource(() => api.indicators(today), [today, refreshKey]);
  const data = result.data;

  return (
    <section className="card" aria-labelledby="indicator-title">
      <div className="card-head">
        <h2 id="indicator-title">Burnout &amp; stress indicator</h2>
        {data?.hasData && (
          <span className={`badge badge-${data.level}`}>{LEVEL_TEXT[data.level].label}</span>
        )}
      </div>

      {result.loading && !data && <Loading />}
      {result.error && <ErrorMessage message={result.error} onRetry={result.reload} />}

      {data && !data.hasData && (
        <p className="muted">Check in for a few days and your indicator will appear here.</p>
      )}

      {data?.hasData && (
        <>
          <p>{LEVEL_TEXT[data.level].summary}</p>
          {data.signals.length > 0 && (
            <ul className="signals">
              {data.signals.map((s) => (
                <li key={s.id}>{s.message}</li>
              ))}
            </ul>
          )}
        </>
      )}

      <details className="how">
        <summary>How is this calculated?</summary>
        <p>The indicator uses your mood check-ins only. It looks for three signals:</p>
        <ul>
          <li>
            <strong>Low streak:</strong> mood of 2 or below on 3 or more days in a row.
          </li>
          <li>
            <strong>Declining trend:</strong> your 7-day average mood is at least 0.5 lower than the
            7 days before.
          </li>
          <li>
            <strong>Missed check-ins:</strong> no check-in on 3 or more of the last 7 days.
          </li>
        </ul>
        <p>No signals means Low, one means Moderate, and two or more means High.</p>
      </details>
    </section>
  );
}
