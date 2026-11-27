# Wellbeing Companion (browser-only version)

A simple, single-user wellbeing app that runs entirely in your browser. It supports:

- **Daily mood check-ins**: mood from 1 to 5 with an optional note. One per day; saving again updates it.
- **Journaling**: write, edit, and delete private reflections.
- **Burnout & stress indicator**: rule-based, using mood check-ins only.
- **Personalized suggestions**: mindfulness, exercise, and self-care ideas that adapt to your mood, your indicator level, and your "Helpful" / "Not for me" feedback.
- **Trends & insights**: 7 and 30-day mood chart, check-in streaks, and plain-language insights.

There is no server. Data is stored in the browser's `localStorage`, so the app can be hosted as a
static site on AWS Amplify Hosting.

> Wellbeing Companion is a self-reflection tool and is **not medical advice**.

**Branches**
- `static-localstorage` (this branch): browser-only, `localStorage`, static hosting.
- `master`: the original version with a local Express API and a JSON data file.

## Requirements

- Node.js 20 or later (developed on Node 26)

## Run it locally

```powershell
npm install
npm run dev
```

Open <http://localhost:5173>. To try every feature quickly, click **Load sample data** in the footer.

> **Windows PowerShell:** if you see "running scripts is disabled on this system", use `npm.cmd`
> instead of `npm` (for example `npm.cmd run dev`), or run the commands from Command Prompt.

| Script | What it does |
| --- | --- |
| `npm run dev` | Starts the app with reload on change |
| `npm run typecheck` | Type-checks the app |
| `npm run build` | Builds the static site into `client/dist` |
| `npm run preview` | Serves the production build locally |

## Deploy to AWS Amplify Hosting

1. Push this branch to GitHub, GitLab, Bitbucket, or CodeCommit.
2. In the Amplify console, choose **Create new app**, connect the repository, and pick the `static-localstorage` branch.
3. Amplify detects `amplify.yml`. It runs `npm ci` and `npm run build`, then publishes `client/dist`.

Routes use `#/` hashes, so no rewrite rules are needed.

## Where data is stored

Everything is one JSON value in `localStorage` under the key `wellbeing-companion:v1`.

- Data stays in this browser on this device. It is not synced, and nothing is sent over the network.
- Clearing site data, or using a private window, removes it.
- If the stored value cannot be read, it is kept under `wellbeing-companion:v1:corrupt-<timestamp>` and the app starts fresh.
- **Delete all my data** in the footer removes everything.

Because any script on the page can read `localStorage`, do not add third-party scripts such as
analytics or ads.

## How the indicator works

The indicator looks at mood check-ins only. It checks for three signals:

| Signal | Rule |
| --- | --- |
| Low streak | Mood of 2 or below on 3 or more days in a row (ending today, or yesterday if you have not checked in today) |
| Declining trend | Average mood over the last 7 days is at least 0.5 lower than the 7 days before (needs 3+ check-ins in each week) |
| Missed check-ins | No check-in on 3 or more of the previous 7 days (days before your first check-in do not count) |

0 signals = **Low**, 1 = **Moderate**, 2 or more = **High**. Thresholds are constants in
`client/src/domain/indicators.ts`.

## How suggestions are picked

The catalog is `client/src/data/catalog.json` (18 items). Each item lists the mood bands
(low = 1–2, mid = 3, high = 4–5) and indicator levels it suits. Each day:

1. Items you marked **Not for me** are removed.
2. Each item scores +2 if it fits today's mood, +2 if it fits your indicator level, and +3 if you marked it **Helpful**.
3. The top 3 are shown, with at most 2 from the same category. Ties are broken by a hash of the date, so suggestions stay the same all day and change from day to day.

If you have not checked in today, every mood band counts as a match.

## Project layout

```
amplify.yml                  Amplify Hosting build settings
shared/types.ts              Shared data types
client/src/
  api/client.ts              The app's data API (the only thing components call for data)
  store/localStore.ts        Store interface and localStorage implementation
  services/                  Data operations: check-ins, journal, feedback
  domain/                    Pure rules: indicators, recommender, insights, dates
  validation.ts              Input checks and limits
  data/                      Catalog and sample data
  pages/, components/        UI
```

## Future tests (not yet added)

- **Unit (Vitest):** `evaluateIndicators`, `recommend`, and `buildInsights` in `client/src/domain` are
  pure functions that take an explicit `today`, so they can be tested with fixed dates.
- **Data API (Vitest):** `createLocalStore(storage)` accepts any `Storage`, so `api` behavior can be
  tested with an in-memory store.
- **End to end (Playwright):** smoke-test the check-in flow against `npm run preview`.
