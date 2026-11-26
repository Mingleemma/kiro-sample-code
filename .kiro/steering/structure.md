# Structure: server-backed version (branch `master`)

```
shared/types.ts              Types shared by server and client (type-only)
server/src/
  index.ts                   Startup: load catalog, open store, listen
  app.ts                     createApp({ store, catalog }), no side effects
  config.ts                  Data file path, port, host
  http.ts                    HttpError and the error handler
  validation.ts              Input parsing for routes
  store/jsonStore.ts         Store interface and JSON file implementation
  domain/                    Pure rules: dates, indicators, recommender, insights
  services/                  Data access on top of the Store (checkins, journal, feedback, catalog)
  routes/                    Express routers: checkins, journal, wellbeing (indicators, recommendations, trends)
  data/catalog.json          Recommendation catalog
  scripts/seed.ts            Sample data generator
client/src/
  main.tsx, App.tsx          Entry and hash routing (#/today, #/journal, #/trends)
  api/client.ts              Typed fetch wrapper. The only place the UI talks to the API.
  hooks/                     useResource (loading/error/reload), useHashRoute
  pages/                     TodayPage, JournalPage, TrendsPage
  components/                Layout, CheckInCard, MoodPicker, IndicatorCard, RecommendationsCard, Status
  lib/                       Date formatting and mood labels
.kiro/specs/wellbeing-companion/requirements.md   Requirements for this branch
```

## Where to put new code
- A new rule or calculation goes in `server/src/domain/` as a pure function.
- A new endpoint gets a router in `server/src/routes/`, data access in `server/src/services/`, and a method in `client/src/api/client.ts`.
- New UI sections are components in `client/src/components/`, composed by a page.
