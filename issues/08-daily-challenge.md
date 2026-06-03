# Daily challenge

## What to build

One shared song, same for all users each day (Wordle model). The daily track is selected deterministically from a cached list. Logged-in users are blocked from replaying the same day's challenge. Guests get a localStorage flag (bypassable — acceptable for MVP). A share button lets users invite others via URL.

## Core components touched

- **Services:** `services/daily/getDailyTrack.ts` (fetch Spotify global top 50 once per day, cache the playlist in Supabase, return `playlist[day_of_year % 50]`)
- **API:** `GET /api/daily` (returns today's clip + quiz session data), `POST /api/daily/complete` (sets `users.last_daily_played` to today's date for logged-in users)
- **Pages:** `app/daily/page.tsx`
- **Components:** `DailyBadge` (labels the challenge as today's daily), `ShareButton` (copies `/daily` URL to clipboard)
- **Replay prevention:** logged-in users with `last_daily_played = today` receive a blocked response from `GET /api/daily`; guests checked via localStorage key

## Acceptance criteria

- [ ] The same track is returned for all users on the same calendar day
- [ ] Different days return different tracks
- [ ] A logged-in user who has already played today sees a "come back tomorrow" state instead of the quiz
- [ ] Completing the daily challenge sets `last_daily_played` on the user's DB row
- [ ] Share button copies the `/daily` URL to clipboard
- [ ] Guest replay prevention uses localStorage (bypassable is acceptable)

## Blocked by

02-charts-quiz-end-to-end, 03-spotify-oauth
