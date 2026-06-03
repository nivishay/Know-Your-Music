# Score & streak persistence

## What to build

Logged-in users' quiz round scores and longest streaks are saved to the database automatically on completion. No UI surfaces this data in MVP — it is persisted for future use.

## Core components touched

- **Services:** `services/db/saveQuizSession.ts` (inserts a completed `quiz_sessions` row with mode, format, score, total_possible), `services/db/saveStreak.ts` (upserts `streaks.longest_streak` — only updates if the new value exceeds the stored value)
- **API:** extends `POST /api/quiz/session/[id]/complete` — calls `saveQuizSession` for quiz rounds; for streak sessions, calls `saveStreak` if the user is logged in
- **DB:** writes to `quiz_sessions`, upserts `streaks`; `last_daily_played` update is handled in the daily challenge slice (08)

## Acceptance criteria

- [ ] Completing a quiz round as a logged-in user inserts a row in `quiz_sessions` with correct mode, format, score, and total_possible
- [ ] Completing a streak session as a logged-in user upserts `streaks.longest_streak` only if the new streak exceeds the stored record
- [ ] Guest completions do not attempt any DB write
- [ ] Persistence is silent — no UI confirmation shown to the user

## Blocked by

03-spotify-oauth, 02-charts-quiz-end-to-end, 09-streak-mode
