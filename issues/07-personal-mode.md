# Personal mode quiz

## What to build

Logged-in users can take a quiz drawn from their own Spotify listening history. The personal pool is built server-side from the user's top tracks and liked songs, filtered to tracks with preview URLs. The quiz then plays through the same UI as every other mode.

## Core components touched

- **Services:** `services/spotify/userLibrary.ts` (fetch user's top tracks and liked songs using their OAuth token), `services/quiz/personalPool.ts` (`buildPersonalPool()` — 35 from top tracks + 15 randomly sampled from liked songs, both filtered to preview URLs; if fewer than 15 liked songs have previews, fill remainder from top tracks)
- **API:** extends `POST /api/quiz/session` with `mode=personal` — retrieves the user's OAuth token from Supabase (not the app token), calls `buildPersonalPool()`, then runs the same clip + distractor generation as other modes
- **Pages:** `app/quiz/personal/page.tsx` (setup page — confirms the user is connected and starts the quiz; redirects guests to login)

## Acceptance criteria

- [ ] `/quiz/personal` is inaccessible to guests — redirects to login
- [ ] Session API with `mode=personal` uses the user's OAuth token, not the app token
- [ ] Pool is built from 35 top tracks + 15 liked songs (preview-filtered); fallback fills from top tracks if liked songs are insufficient
- [ ] Quiz plays through identically to the charts flow (same UI, same scoring)

## Blocked by

02-charts-quiz-end-to-end, 03-spotify-oauth
