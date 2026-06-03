# Home page & mode picker

## What to build

The landing page users see first. Guests see all mode tiles plus a prominent Spotify connect CTA. Connected users see the same tiles without the CTA. Tapping a tile navigates to the relevant setup or quiz route.

## Core components touched

- **Pages:** `app/page.tsx`
- **Components:** `ModeCard` (tile for each mode: Charts, Genre, Artist, Daily, Streak), `SpotifyConnectCTA` (shown to guests only, explains what personal mode unlocks), `GuestBadge` (indicates guest state in header or nav)

## Acceptance criteria

- [ ] Home page shows tiles for: Charts, Genre, Artist, Daily Challenge, Streak Mode
- [ ] Guest users see a Spotify connect CTA explaining what they are missing
- [ ] Connected users do not see the CTA
- [ ] Each tile navigates to the correct route
- [ ] Mobile-first layout with large tap targets

## Blocked by

01-scaffold
