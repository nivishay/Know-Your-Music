## What to build

Polish the entry and exit points into the quiz.

**Landing page (`/`):** App name, tagline, "Connect with Spotify" button. Minimal — no quiz content.

**Home screen (`/home`):** Three sections:
1. "How well do you know your music?" — primary card that starts a 5-song Your Music Quiz
2. Artist cards — horizontally scrollable strip of the user's top 20 artists (`GET /me/top/artists`), each card labeled "How well do you know [Artist]?" (artist quiz wired up in issue #08)
3. "Try a Song" — demo mode entry (wired up in issue #09)

**Results page (`/results/[sessionId]`):** Score, score label, song-by-song breakdown (was it correct?), CTAs: "Play again", "Try another artist", "Back to home".

## Acceptance criteria

- [ ] `/` renders landing page; unauthenticated users see only this page
- [ ] `/home` shows all three sections with real data (top 20 artists fetched)
- [ ] "Your Music Quiz" card starts the quiz and navigates to `/quiz/[sessionId]`
- [ ] `/results/[sessionId]` shows score, label, per-song result breakdown
- [ ] All three CTAs on results page navigate correctly
- [ ] Mobile-first layout; tap targets are large enough for the 4 answer buttons

## Blocked by

- #05 Full quiz round
