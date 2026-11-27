# Structure: browser-only version (branch `static-localstorage`)

```
amplify.yml                  Amplify Hosting build settings
shared/types.ts              Shared data types (type-only)
client/
  index.html, vite.config.ts
  src/
    main.tsx, App.tsx        Entry and hash routing (#/today, #/journal, #/trends)
    api/client.ts            The app's data API (async). The only thing components call for data.
    store/localStore.ts      Store interface and localStorage implementation
    services/                Data access on top of the Store: checkins, journal, feedback
    domain/                  Pure rules: dates, indicators, recommender, insights
    validation.ts            Input checks and limits (NOTE_MAX, JOURNAL_MAX)
    data/catalog.json        Recommendation catalog (validated in data/catalog.ts)
    data/sampleData.ts       Sample data for "Load sample data"
    hooks/                   useResource (loading/error/reload), useHashRoute
    pages/                   TodayPage, JournalPage, TrendsPage
    components/              Layout, DataControls, CheckInCard, MoodPicker, IndicatorCard, RecommendationsCard, Status
    lib/                     Date formatting, mood labels, ID generation
.kiro/specs/wellbeing-companion/requirements.md   Requirements for this branch
```

## Where to put new code
- A new rule or calculation goes in `client/src/domain/` as a pure function.
- A new data operation gets a function in `client/src/services/` and a method on `api` in `client/src/api/client.ts`.
- New UI sections are components in `client/src/components/`, composed by a page.
- Changes to the stored data shape go in `shared/types.ts` (`DbSchema`). Handle old data in `normalize()` in `localStore.ts`, or bump the storage key version.
