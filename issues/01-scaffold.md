# Project scaffold & database schema

## What to build

Initialize the Next.js + TypeScript project and wire up all infrastructure dependencies so every subsequent slice has a working foundation to build on.

End-to-end behavior: the app boots locally, all 7 routes return placeholder pages, and the 3 DB tables exist in Supabase.

## Core components touched

- **DB migrations:** `users` (spotify_id, refresh_token encrypted, last_daily_played, created_at), `quiz_sessions` (id, user_id, mode, format, score, total_possible, created_at), `streaks` (user_id, longest_streak)
- **Lib:** `lib/supabase/server.ts`, `lib/supabase/client.ts`
- **Config:** typed `env.ts` (validates all required env vars at startup), `.env.example`, `next.config.ts`
- **Types:** `types/index.ts` (shared domain types: Clip, QuizSession, QuizAnswer, etc.)
- **Pages:** route placeholder files for `/`, `/daily`, `/quiz/general`, `/quiz/personal`, `/quiz/[sessionId]`, `/results/[sessionId]`, `/auth/callback`

## Acceptance criteria

- [ ] `npm run dev` starts without errors
- [ ] All 7 routes return a 200 with placeholder content
- [ ] Supabase migration runs cleanly and all 3 tables exist with correct columns
- [ ] App fails fast with a clear error at startup if any required env var is missing
- [ ] `.env.example` documents every required variable

## Blocked by

None — can start immediately
