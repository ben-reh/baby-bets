# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run start    # Start production server
```

## Architecture

**Next.js 14 App Router** app with three pages:
- `/` — Guest submission form (mobile-friendly, linked via QR code)
- `/dashboard` — Live monitor display showing all guesses + stats
- `/qr` — Printable QR code pointing to the submission URL

**Database**: `better-sqlite3` (synchronous SQLite). The singleton and `eventBus` (Node.js `EventEmitter`) live in `db/index.ts`. The DB file path comes from `DB_PATH` env var (defaults to `./baby_bets.db`). Must NOT be imported from client components — server/API only.

**Real-time**: SSE via `app/api/stream/route.ts`. When a guess is POSTed, `eventBus.emit('new_guess')` fires, which sends a `data: ping` to all connected SSE clients. The dashboard's `GuessFeed` component re-fetches `/api/guesses` on each ping.

**Stats**: Pure functions in `lib/stats.ts` — `computeStats()`, `formatDate()`, `formatTime()`. Called client-side inside `GuessFeed`.

## Environment Variables

```
APP_URL=http://localhost:3000          # used by /qr page to generate the QR code URL
DYNAMODB_REGION=us-east-1             # AWS region
DYNAMODB_TABLE=baby-bets-guesses-test # table name (see Databases below)
DYNAMODB_ACCESS_KEY_ID=...            # only needed if not using default AWS credentials
DYNAMODB_SECRET_ACCESS_KEY=...        # only needed if not using default AWS credentials
```

## Databases

Two DynamoDB tables in `us-east-1`:

| Environment | Table |
|-------------|-------|
| Local dev   | `baby-bets-guesses-test` |
| Production  | `baby-bets-guesses` |

`.env.local` sets `DYNAMODB_TABLE=baby-bets-guesses-test` so local dev always hits the test table.
Amplify env vars set `DYNAMODB_TABLE=baby-bets-guesses` for production.

To seed the test table: `node scripts/seed.mjs`

## Deployment

This project is **not deployed on Railway**. Deployment platform TBD.
