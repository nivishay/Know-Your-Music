# Genre mode

## What to build

Users can pick a genre from a curated list and be quizzed on tracks from that genre. The genre picker sits inside the general mode setup flow, and the existing quiz session API is extended to accept a genre seed.

## Core components touched

- **Data:** `lib/genres.ts` (hardcoded list of 15 genres with display name, emoji, and Spotify genre seed: Pop, Hip-Hop, Rock, R&B, Latin, EDM, Country, Jazz, Indie, Metal, K-Pop, Classical, Reggae, Blues, Soul)
- **API:** extends `POST /api/quiz/session` — adds `mode=genre&genre=<seed>` path, uses Spotify `/v1/recommendations` with the genre seed to source tracks
- **Pages:** `app/quiz/general/page.tsx` (genre-picker step in the general mode setup flow)
- **Components:** `GenrePicker`, `GenreCard` (emoji + label, tappable)

## Acceptance criteria

- [ ] General mode setup shows a genre picker with all 15 genres
- [ ] Selecting a genre and starting a quiz returns 5 clips sourced from that genre
- [ ] Quiz plays through identically to the charts flow (same UI, same scoring)
- [ ] Genre picker is scrollable and usable on mobile

## Blocked by

02-charts-quiz-end-to-end, 04-home-page
