# Home page: guest Daily Challenge hero layout

## Parent

`issues/04-home-page.md`

## What to build

Replace the current flat card list on the guest landing page with a two-section layout:

1. **Daily Challenge hero** — the day's quiz session is pre-generated server-side before the page renders. The hero shows a prominent play button and a "Today's Challenge" label. Tapping the button navigates directly to `/quiz/[sessionId]` with no loading state.
2. **General mode cards** — Charts, Genre, Artist, Streak displayed below the hero as tappable mode tiles.
3. **Spotify connect CTA** — at the bottom, explaining that connecting Spotify unlocks Personal mode and quiz modes built from the user's own library.

The server component at `/` is responsible for fetching or generating the daily session and passing the resulting `dailySessionId` down to `HomePageClient` as a prop. `HomePageClient` receives `dailySessionId` alongside the existing `isAuthenticated` prop.

Replay prevention for the Daily Challenge follows the existing rule: guests use a `localStorage` flag (bypassable — acceptable for MVP).

## Acceptance criteria

- [ ] Guest landing page shows a Daily Challenge hero section above the mode cards
- [ ] The hero has a clearly visible play button and a "Today's Challenge" label
- [ ] Tapping play navigates to `/quiz/[sessionId]` with no loading spinner on the button
- [ ] The daily session is pre-generated server-side — the `sessionId` is embedded in the page, not fetched client-side on tap
- [ ] Below the hero, four General mode cards are shown: Charts, Genre, Artist, Streak
- [ ] A Spotify connect CTA appears at the bottom for guests, explaining Personal mode
- [ ] Guest who has already played today's challenge sees a "come back tomorrow" state on the hero (localStorage flag)
- [ ] `HomePageClient` test coverage updated: hero renders for guests, play button is present, four general cards are present, CTA is present

## Blocked by

- `08-daily-challenge` — needs the `getDailyTrack` / daily session service to exist
