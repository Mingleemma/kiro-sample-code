# Wellbeing Companion

A simple, single-user wellbeing app that runs on your own computer. It supports:

- **Daily mood check-ins**: mood from 1 to 5 with an optional note. One per day; saving again updates it.
- **Journaling**: write, edit, and delete private reflections.
- **Burnout & stress indicator**: rule-based, using mood check-ins only.
- **Personalized suggestions**: mindfulness, exercise, and self-care ideas that adapt to your mood, your indicator level, and your "Helpful" / "Not for me" feedback.
- **Trends & insights**: 7 and 30-day mood chart, check-in streaks, and plain-language insights.

> Wellbeing Companion is a self-reflection tool and is **not medical advice**.

## Requirements

- Node.js 20 or later (developed on Node 26)

## Run it

```powershell
npm install
npm run seed        # optional: ~30 days of sample data for demos
npm run dev         # starts the API (port 3001) and the web app (port 5173)
```

Open <http://localhost:5173>.

> **Windows PowerShell:** if you see "running scripts is disabled on this system", use `npm.cmd`
> instead of `npm` (for example `npm.cmd run dev`), or run the commands from Command Prompt.

| Script | What it does |
| --- | --- |
| `npm run dev` | Starts the API and the web app together, with reload on change |
| `npm run seed` | Adds sample data if there is none yet |
| `npm run seed -- --force` | Replaces all existing data with sample data |
| `npm run typecheck` | Type-checks the server and client |
| `npm run build` | Builds the web app into `client/dist` |

## Where data is stored

All data lives in one JSON file: `server/data/db.json`. It is created on first run and ignored by git.
Set `WELLBEING_DATA_FILE` to use a different path. Writes go to a temporary file first and are then
renamed into place, so a crash cannot leave a half-written file. To start fresh, stop the server and
delete the file.

The API listens on `127.0.0.1` only, because the app has no login.

## How the indicator works

The indicator looks at mood check-ins only. It checks for three signals:

| Signal | Rule |
| --- | --- |
| Low streak | Mood of 2 or below on 3 or more days in a row (ending today, or yesterday if you have not checked in today) |
| Declining trend | Average mood over the last 7 days is at least 0.5 lower than the 7 days before (needs 3+ check-ins in each week) |
| Missed check-ins | No check-in on 3 or more of the previous 7 days (days before your first check-in do not count) |

0 signals = **Low**, 1 = **Moderate**, 2 or more = **High**. Thresholds are constants in
`server/src/domain/indicators.ts`.

## How suggestions are picked

The catalog is `server/src/data/catalog.json` (18 items). Each item lists the mood bands
(low = 1–2, mid = 3, high = 4–5) and indicator levels it suits. Each day:

1. Items you marked **Not for me** are removed.
2. Each item scores +2 if it fits today's mood, +2 if it fits your indicator level, and +3 if you marked it **Helpful**.
3. The top 3 are shown, with at most 2 from the same category. Ties are broken by a hash of the date, so suggestions stay the same all day and change from day to day.

If you have not checked in today, every mood band counts as a match.

## Project layout

```
shared/types.ts            Types shared by server and client
server/src/
  index.ts, app.ts         Startup and Express app (createApp has no side effects)
  store/jsonStore.ts       JSON file store with atomic, queued writes
  domain/                  Pure rules: indicators, recommender, insights, dates
  services/                Data access on top of the store
  routes/                  REST endpoints under /api
  data/catalog.json        Recommendation catalog
  scripts/seed.ts          Sample data generator
client/src/
  pages/                   Today, Journal, Trends
  components/              Check-in, indicator, suggestions, layout
  api/client.ts            Typed fetch wrapper
```

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| GET | `/api/checkins?from&to` | List check-ins in a date range |
| PUT | `/api/checkins/:date` | Create or update a check-in `{ mood, note? }` |
| GET / POST | `/api/journal` | List entries (newest first) / create `{ text }` |
| PUT / DELETE | `/api/journal/:id` | Update `{ text }` / delete |
| GET | `/api/indicators?today` | Burnout & stress indicator |
| GET | `/api/recommendations?today` | Today's suggestions |
| POST / DELETE | `/api/recommendations/:id/feedback` | Set `{ verdict: "helpful" \| "not_for_me" }` / clear |
| GET | `/api/trends?range=7\|30&today` | Series, streaks, and insights |

`today` is optional; the web app sends the browser's local date so rules match your time zone.

## Future tests (not yet added)

The code is structured so tests can be added without refactoring:

- **Unit (Vitest):** `evaluateIndicators`, `recommend`, and `buildInsights` in `server/src/domain` are
  pure functions that take an explicit `today`, so they can be tested with fixed dates.
- **API (Supertest):** `createApp({ store, catalog })` builds the app without listening. Pass a store
  created with `createJsonStore()` pointed at a temp file.
- **End to end (Playwright):** smoke-test the check-in flow against `npm run dev`, using
  `WELLBEING_DATA_FILE` to isolate data.
