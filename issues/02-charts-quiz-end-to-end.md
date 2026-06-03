# Charts quiz — end to end (tracer bullet)

## What to build

The core vertical slice of the product: a user lands on a page, a 5-clip quiz is generated from Spotify's global charts, they play through all clips answering two sequential questions each, and see a results screen with their score label. Every layer — Spotify API, server service, DB session row, quiz UI, results UI — is exercised by this slice.

## Core components touched

- **Services:** `services/spotify/appToken.ts` (`getSpotifyAppToken()` singleton — Client Credentials flow, cached, auto-refreshed), `services/quiz/generateClips.ts` (fetch tracks, filter to preview URLs, return 5), `services/quiz/generateDistractors.ts` (call `/v1/recommendations` seeded on correct track, extract artists, deduplicate, remove correct artist, retry up to 2x if fewer than 3 unique wrong artists found, skip track if still insufficient)
- **API:** `POST /api/quiz/session` — accepts `{ mode: "charts" }`, generates 5 clips with 4 options each, creates a `quiz_sessions` row, returns session ID + clips to client
- **Pages:** `app/quiz/[sessionId]/page.tsx`, `app/results/[sessionId]/page.tsx`
- **Components:** `AudioPlayer` (30s preview, play/replay button, zero identifying info — no title/artist/art), `QuestionCard`, `AnswerOptions` (4 options, one correct), `ScoreScreen` (score out of 10 + label: Superfan / True Fan / Casual Listener / Just Passing Through / Who Are You?)

## Acceptance criteria

- [ ] `POST /api/quiz/session` with `mode=charts` returns 5 clips, each with a preview URL and exactly 4 answer options (1 correct + 3 distractors); correct answer never appears in the distractor list
- [ ] No clip in the response is missing a preview URL
- [ ] Quiz UI shows Q1 (song title) first; Q2 (artist) only appears after Q1 is answered
- [ ] Audio player shows no song title, artist name, or album art at any point
- [ ] Play and replay buttons work; clip can be replayed unlimited times
- [ ] Scoring: 1 point per correct answer, max 2 per clip, max 10 per round
- [ ] Results screen shows correct score label for the score achieved
- [ ] A `quiz_sessions` row is created in the DB when the session is initialized

## Blocked by

01-scaffold
