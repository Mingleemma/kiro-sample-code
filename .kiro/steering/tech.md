# Tech: browser-only version (branch `static-localstorage`)

## Stack
- TypeScript everywhere, strict mode
- React 19 + Vite 7, Recharts 3 for charts, plain CSS (`client/src/styles.css`)
- Storage: browser `localStorage`, one JSON value under the key `wellbeing-companion:v1`
- No backend. Hosting: AWS Amplify Hosting as a static site (`amplify.yml` at the repo root)
- npm workspaces: `shared` (types) and `client`

## Commands
On Windows PowerShell use `npm.cmd` if script execution is disabled.
- `npm install`
- `npm run dev` starts Vite at localhost:5173
- `npm run typecheck` must pass before committing
- `npm run build` builds the static site into `client/dist`
- `npm run preview` serves the production build locally

## Conventions
- Shared types live in `shared/types.ts`. Import them with `import type` only.
- Business rules are pure functions in `client/src/domain/`. They take an explicit `today` date and never touch storage, the DOM, or React, so they stay testable.
- Components get data only through `api` in `client/src/api/client.ts`. Never call `localStorage` from components, pages, or services.
- All persistence goes through the `Store` interface (`read`, `update`) in `client/src/store/localStore.ts`. `createLocalStore(storage)` accepts any `Storage`, so tests can pass a fake.
- If stored data cannot be parsed, keep the raw value under a backup key. Never silently discard user data.
- Validate input inside `api` methods using `client/src/validation.ts`. Throw `ValidationError` (or `Error`) with a message that is safe to show to the user.
- `api` methods stay async, so the storage backend can change later without touching components.
- Dates are calendar days as `YYYY-MM-DD` in the browser's local time zone (`lib/dates.ts` `localToday`).
- Generate IDs with `lib/ids.ts` `newId()`, which works outside secure contexts too.
- Do not add third-party scripts, analytics, or remote calls.
- UI: every input has a label, interactive elements are keyboard accessible, and every data view handles loading, error, and empty states.

## Deployment (Amplify Hosting)
- Connect the repo branch in Amplify. `amplify.yml` runs `npm ci` and `npm run build` and publishes `client/dist`.
- Routing uses `#/` hashes, so no rewrite rules are needed.

## Testing (planned, not yet added)
- Vitest unit tests for `evaluateIndicators`, `recommend`, and `buildInsights` with fixed dates
- Vitest tests for `api` using `createLocalStore` with an in-memory `Storage`
- Playwright smoke test of the check-in flow against `npm run preview`
Do not add tests unless asked.
