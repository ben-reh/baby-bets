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
DB_PATH=./baby_bets.db       # path to SQLite file (relative to project root or absolute)
APP_URL=http://localhost:3000 # used by /qr page to generate the QR code URL
```

## Deployment (Railway)

1. Create Railway service, connect GitHub repo
2. Add persistent volume mounted at `/data`
3. Set env vars: `DB_PATH=/data/baby_bets.db`, `APP_URL=https://<subdomain>.up.railway.app`
4. Railway auto-detects Next.js and runs `npm run build && npm start`
5. Navigate to `/qr` after deploy to get the printable QR code
