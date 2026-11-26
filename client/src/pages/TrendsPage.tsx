import { useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TrendRange } from '@wellbeing/shared';
import { api } from '../api/client';
import { ErrorMessage, Loading } from '../components/Status';
import { useResource } from '../hooks/useResource';
import { formatDay, formatShortDay, localToday } from '../lib/dates';
import { moodLabel } from '../lib/moods';

const RANGES: TrendRange[] = [7, 30];

export function TrendsPage() {
  const [range, setRange] = useState<TrendRange>(7);
  const today = localToday();
  const trends = useResource(() => api.trends(range, today), [range, today]);
  const data = trends.data;

  const chartData = data?.series.map((p) => ({ ...p, label: formatShortDay(p.date) })) ?? [];

  return (
    <div className="stack-lg">
      <div className="card-head">
        <h1 className="page-title">Trends</h1>
        <div className="toggle" role="group" aria-label="Time range">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              className={range === r ? 'btn btn-small active' : 'btn btn-small'}
              aria-pressed={range === r}
              onClick={() => setRange(r)}
            >
              {r} days
            </button>
          ))}
        </div>
      </div>

      {trends.loading && !data && <Loading />}
      {trends.error && <ErrorMessage message={trends.error} onRetry={trends.reload} />}

      {data && (
        <>
          <div className="stats">
            <Stat label="Average mood" value={data.average === null ? '–' : `${data.average}/5`} />
            <Stat label="Check-ins" value={`${data.checkInCount}/${data.range}`} />
            <Stat label="Current streak" value={`${data.currentStreak} day${data.currentStreak === 1 ? '' : 's'}`} />
            <Stat label="Longest streak" value={`${data.longestStreak} day${data.longestStreak === 1 ? '' : 's'}`} />
          </div>

          <section className="card" aria-labelledby="chart-title">
            <h2 id="chart-title">Mood over the last {data.range} days</h2>
            {data.checkInCount === 0 ? (
              <p className="muted">No check-ins in this period yet.</p>
            ) : (
              <div className="chart" role="img" aria-label={`Line chart of daily mood over the last ${data.range} days`}>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={chartData} margin={{ top: 10, right: 16, bottom: 0, left: -16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} interval="preserveStartEnd" minTickGap={16} />
                    <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip
                      labelFormatter={(_label, payload) => {
                        const date = payload?.[0]?.payload?.date as string | undefined;
                        return date ? formatDay(date) : '';
                      }}
                      formatter={(value) => {
                        const n = Number(value);
                        return [`${n} · ${moodLabel(n)}`, 'Mood'];
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="mood"
                      stroke="#2f855a"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      connectNulls
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            {data.checkInCount > 0 && data.checkInCount < data.range && (
              <p className="hint">Days without a check-in are skipped in the line.</p>
            )}
          </section>

          <section className="card" aria-labelledby="insights-title">
            <h2 id="insights-title">Insights</h2>
            <ul className="insights">
              {data.insights.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}
