import { useState } from 'react';
import { CheckInCard } from '../components/CheckInCard';
import { IndicatorCard } from '../components/IndicatorCard';
import { RecommendationsCard } from '../components/RecommendationsCard';
import { localToday } from '../lib/dates';

export function TodayPage() {
  const today = localToday();
  // Bumped after each check-in so the indicator and suggestions refresh.
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="stack-lg">
      <h1 className="page-title">Today</h1>
      <CheckInCard today={today} onSaved={() => setRefreshKey((k) => k + 1)} />
      <div className="grid-2">
        <IndicatorCard today={today} refreshKey={refreshKey} />
        <RecommendationsCard today={today} refreshKey={refreshKey} />
      </div>
    </div>
  );
}
