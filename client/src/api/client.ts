import type {
  CheckIn,
  Feedback,
  IndicatorResult,
  IsoDate,
  JournalEntry,
  Mood,
  RecommendationsResponse,
  TrendRange,
  TrendsResponse,
  Verdict,
} from '@wellbeing/shared';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    });
  } catch {
    throw new Error('Cannot reach the server. Is it running?');
  }
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.error ?? `Request failed (${res.status}).`);
  return body as T;
}

const json = (method: string, body?: unknown): RequestInit => ({
  method,
  body: body === undefined ? undefined : JSON.stringify(body),
});

const qs = (params: Record<string, string | number>) =>
  '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString();

export const api = {
  health: () => request<{ status: string }>('/health'),

  listCheckins: (from: IsoDate, to: IsoDate) => request<CheckIn[]>(`/checkins${qs({ from, to })}`),
  saveCheckin: (date: IsoDate, mood: Mood, note: string) =>
    request<CheckIn>(`/checkins/${date}`, json('PUT', { mood, note })),

  listJournal: () => request<JournalEntry[]>('/journal'),
  createJournal: (text: string) => request<JournalEntry>('/journal', json('POST', { text })),
  updateJournal: (id: string, text: string) =>
    request<JournalEntry>(`/journal/${encodeURIComponent(id)}`, json('PUT', { text })),
  deleteJournal: (id: string) => request<void>(`/journal/${encodeURIComponent(id)}`, json('DELETE')),

  indicators: (today: IsoDate) => request<IndicatorResult>(`/indicators${qs({ today })}`),

  recommendations: (today: IsoDate) =>
    request<RecommendationsResponse>(`/recommendations${qs({ today })}`),
  setFeedback: (id: string, verdict: Verdict) =>
    request<Feedback>(`/recommendations/${encodeURIComponent(id)}/feedback`, json('POST', { verdict })),
  clearFeedback: (id: string) =>
    request<void>(`/recommendations/${encodeURIComponent(id)}/feedback`, json('DELETE')),

  trends: (range: TrendRange, today: IsoDate) =>
    request<TrendsResponse>(`/trends${qs({ range, today })}`),
};
