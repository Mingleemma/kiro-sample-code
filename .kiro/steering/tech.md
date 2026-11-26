# Tech: server-backed version (branch `master`)

## Stack
- TypeScript everywhere, strict mode
- Frontend: React 19 + Vite 7, Recharts 3 for charts, plain CSS (`client/src/styles.css`)
- Backend: Node.js 20+ with Express 5, run with `tsx` (no compile step)
- Storage: one JSON file, `server/data/db.json` (git-ignored). Override with `WELLBEING_DATA_FILE`.
- npm workspaces: `shared`, `server`, `client`

## Commands
On Windows PowerShell use `npm.cmd` if script execution is disabled.
- `npm install`
- `npm run dev` starts the API (127.0.0.1:3001) and Vite (localhost:5173, proxies `/api`)
- `npm run seed` adds sample data if none exists; `npm run seed -- --force` replaces all data
- `npm run typecheck` must pass before committing
- `npm run build` builds the client into `client/dist`

## Conventions
- Shared types live in `shared/types.ts`. Import them with `import type` only.
- Business rules are pure functions in `server/src/domain/`. They take an explicit `today` date and never do I/O, so they stay testable.
- All persistence goes through the `Store` interface (`read`, `update`) in `server/src/store/jsonStore.ts`. Never read or write `db.json` directly from routes or services.
- Writes are queued and atomic (temp file, then rename). Keep it that way.
- Validate all request input at the route boundary using `server/src/validation.ts`, and throw `HttpError` for client errors. Error responses are `{ "error": "message" }`.
- Dates are calendar days as `YYYY-MM-DD`. The client sends its local `today`; the server accepts it only within one day of server time.
- The API binds to 127.0.0.1 only, because there is no authentication.
- Server-side relative imports use `.js` extensions (ESM).
- UI: every input has a label, interactive elements are keyboard accessible, and every data view handles loading, error, and empty states.

## Testing (planned, not yet added)
- Vitest unit tests for `evaluateIndicators`, `recommend`, and `buildInsights` with fixed dates
- Supertest API tests via `createApp({ store, catalog })` with a temp data file
- Playwright smoke test of the check-in flow
Do not add tests unless asked.
