# Home page: authenticated General/Personal toggle

## Parent

`issues/04-home-page.md`

## What to build

For authenticated users, replace the current flat card list with a top-level **General | Personal** toggle and a mode-specific card set below it.

**Toggle behaviour:**
- Defaults to Personal on first visit
- State is persisted in `localStorage` so returning users land in their last-selected mode
- No page navigation on toggle — the card set updates in place

**General mode cards:** Charts, Genre, Artist, Streak, Daily Challenge

**Personal mode cards:** Artist, Streak, Daily Challenge

The Daily Challenge card is always visible regardless of the active toggle. When Personal is active, the Daily Challenge card carries a visible **"General"** badge to signal that it draws from a shared pool rather than the user's library.

The Spotify connect CTA is not shown to authenticated users.

This slice does not implement the Personal Artist drawer (that is covered in `15-home-personal-artist-drawer`). Tapping the Personal Artist card can navigate to a placeholder or be a no-op for now.

## Acceptance criteria

- [ ] Authenticated users see a General | Personal toggle at the top of the home page
- [ ] Toggle defaults to Personal on first visit
- [ ] Toggle selection is persisted in `localStorage` and restored on return visits
- [ ] Personal mode shows: Artist, Streak, Daily Challenge
- [ ] General mode shows: Charts, Genre, Artist, Streak, Daily Challenge
- [ ] Daily Challenge card is visible in both toggle states
- [ ] Daily Challenge card shows a "General" badge when Personal is the active toggle
- [ ] Spotify connect CTA is not rendered for authenticated users
- [ ] `HomePageClient` test coverage updated: toggle renders, defaults to Personal, correct cards per mode, Daily visible in both modes with badge in Personal

## Blocked by

- `03-spotify-oauth` — authenticated state must be available
- `13-home-guest-hero` — builds on the updated `HomePageClient` prop interface (`dailySessionId`)
