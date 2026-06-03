## Problem Statement

Music fans have no fun, low-stakes way to test how well they actually know the songs and artists they listen to. Streaming apps tell you what you have played but never challenge your knowledge. A casual, audio-driven quiz experience is missing.

## Solution

Know Your Music is a mobile-first web app that quizzes users on 30-second Spotify audio clips. For each clip, the user answers two sequential multiple-choice questions — song title then artist — scoring points on each. Guests can play general-interest quizzes immediately; Spotify-connected users unlock a personal mode that draws from their own listening history. A daily challenge gives every user a shared song to identify each day.

## User Stories

1. As a guest, I want to start a quiz immediately without creating an account, so that I can try the app without commitment.
2. As a guest, I want to play a quiz based on popular chart tracks, so that I can be tested on songs I likely know.
3. As a guest, I want to select a genre and be quizzed on tracks from it, so that I can focus on music I care about.
4. As a guest, I want to search for an artist and be quizzed on their tracks, so that I can deep-dive on a favourite.
5. As a guest, I want to browse a curated list of popular artists without typing, so that I can pick one quickly.
6. As a guest, I want to see a prompt to connect Spotify, so that I understand what I am missing by not logging in.
7. As a connected user, I want to log in with Spotify so that the app can access my listening history without a separate account.
8. As a connected user, I want to play a personal mode quiz drawn from my top tracks and liked songs, so that I am tested on music I actually listen to.
9. As any user, I want to hear a 30-second audio clip for each question, so that I can identify the song by ear.
10. As any user, I want a prominent play button to start each clip, so that I am never left staring at a silent screen.
11. As any user, I want the audio player to show no song title, artist name, or album art, so that the answer is not revealed before I guess.
12. As any user, I want to replay a clip as many times as I need, so that I do not lose a question to a missed listen.
13. As any user, I want to answer "Name That Song" first (4 options), so that I am quizzed on the song title from each clip.
14. As any user, I want the artist question to appear only after I have answered the song question, so that each question is resolved before the next appears.
15. As any user, I want to earn 1 point per correct answer (2 per clip, 10 per round), so that I get credit for partial knowledge.
16. As any user, I want to see a score label at the end of a round (Superfan / True Fan / Casual Listener / Just Passing Through / Who Are You?), so that my result feels meaningful and shareable.
17. As any user, I want to see a fun fact about the song and artist after each clip, so that I learn something even if I got it wrong.
18. As any user, I want the fun fact to appear without blocking my progress, so that I am not stuck waiting if it loads slowly.
19. As any user, I want to play the Daily Challenge — one shared song, same for everyone today — so that I have a daily ritual to look forward to.
20. As any user, I want to share the Daily Challenge via a URL, so that I can invite friends to try the same song.
21. As a logged-in user, I want to be prevented from replaying the Daily Challenge on the same day, so that the result stays meaningful.
22. As any user, I want to play Streak Mode — endless clips with 3 hearts — so that I can test how far I can go.
23. As any user starting Streak Mode, I want to choose general or personal pool (personal only if logged in), so that I am in control of what I am tested on.
24. As a Streak Mode player, I want to keep my streak alive if I get at least one of the two questions right per clip, so that partial knowledge is rewarded.
25. As a Streak Mode player, I want to lose a heart only when I get both questions on a clip wrong, so that the rules feel fair.
26. As a logged-in Streak Mode player, I want my longest-ever streak saved, so that I have a personal record to beat.
27. As a logged-in user, I want my Quiz Round scores saved automatically, so that my history is preserved even if there is no UI for it yet.

## Implementation Decisions

**Authentication & Token Handling**
- Spotify OAuth is the only login method — no separate account system
- Refresh token stored encrypted in the `users` DB row; access token stored in an HttpOnly cookie (1-hour TTL)
- Server silently refreshes the access token on each request when expired
- Tokens never reach client-side JS

**Dual Spotify Auth Paths**
- General mode: server-side Client Credentials flow via a `getSpotifyAppToken()` singleton — cached, auto-refreshed
- Personal mode: user OAuth token retrieved from DB per request
- Both paths are server-only; the frontend never calls Spotify directly

**Question Generation**
- All clips for a Quiz Round pre-generated upfront in a single server call (5 clips + 3 distractors each)
- Streak Mode fetches in batches of 10; refill triggered when 3 clips remain
- Tracks without preview URLs are filtered out before selection

**Distractor Generation**
- Source: Spotify `/v1/recommendations` seeded with the correct track
- Name That Artist: extract artists from recommendations, deduplicate, remove correct artist
- If fewer than 3 unique wrong artists: retry up to 2x with a different seed; skip track if still insufficient

**Personal Mode Pool**
- ~50 tracks per session: 35 from top tracks + 15 randomly sampled from liked songs (both filtered to preview URLs)
- If fewer than 15 liked songs have previews, remainder filled from top tracks

**Daily Challenge**
- Spotify global top 50 fetched once per day and cached in Supabase
- Deterministic daily pick: `day_of_year % 50`
- Logged-in users: replay blocked via `last_daily_played` date on `users` row
- Guests: localStorage flag (bypassable — not worth solving in MVP)
- Share = URL to `/daily`, no score persisted

**Question Format per Clip**
- Name That Song (4 options) → user answers → Name That Artist (4 options) → user answers → fun fact shown
- 1 point per correct answer; max 2 per clip

**Streak Heart Rule**
- Both wrong → lose 1 heart
- At least one correct → no heart lost

**Gemini Fun Facts**
- Called asynchronously after user answers both questions on a clip
- 3-second hard timeout; silent failure (section hidden, no error message)

**Genre List**
- Curated hardcoded list of ~15 genres with emoji: Pop, Hip-Hop, Rock, R&B, Latin, EDM, Country, Jazz, Indie, Metal, K-Pop, Classical, Reggae, Blues, Soul

**Database Schema**
- `users`: `spotify_id`, `refresh_token` (encrypted), `last_daily_played`, `created_at`
- `quiz_sessions`: `id`, `user_id`, `mode` (general/personal), `format` (round/streak), `score`, `total_possible`, `created_at`
- `streaks`: `user_id`, `longest_streak`

**Routing**
- `/` — home, mode picker
- `/daily` — daily challenge
- `/quiz/general` — general mode setup
- `/quiz/personal` — personal mode (Spotify required)
- `/quiz/[sessionId]` — active quiz
- `/results/[sessionId]` — score screen + fun facts
- `/auth/callback` — Spotify OAuth callback

## Testing Decisions

Good tests verify externally observable behavior — what the user sees and what ends up in the DB — not internal implementation details like which Spotify endpoint was called or how a utility function is structured.

**What to test:**
- Quiz session API route: given a mode/format, returns a valid batch of clips with 4 options each (including exactly 3 distractors), no correct answer in the distractor list, no clips missing preview URLs
- Scoring logic: correct/incorrect combinations produce the right point totals and heart loss outcomes
- Distractor deduplication: duplicate artists and the correct artist are never present in the options list
- Daily challenge selection: same `day_of_year` input always returns the same track index; different days return different indexes
- Gemini timeout: if the call takes more than 3 seconds, the fun fact section is absent from the response — no error state surfaced
- Replay prevention: a logged-in user with `last_daily_played = today` gets a blocked response from the daily challenge route

## Out of Scope

- Song Sequence question type
- Release year / decade questions
- Quiz history / profile UI (data saved to DB, UI deferred to v2)
- Leaderboards (global or friends)
- Image-based score sharing cards
- Email / password accounts
- Spotify Premium or full-track playback
- Pre-generated or cached fun facts
- Daily login streak tracking
- Difficulty settings

## Further Notes

- Audio autoplay is intentionally absent — mobile browsers block it. The play button is always the entry point.
- The audio player must never display song title, artist name, or album art that could reveal the answer.
- Mid-quiz tab/browser close results in silent progress loss — no `beforeunload` dialog (inconsistent on mobile).
- Artist deep dive: search bar at top + scrollable curated artist list below for discoverability without typing.
- Score labels: 10 = Superfan, 8-9 = True Fan, 5-7 = Casual Listener, 3-4 = Just Passing Through, 0-2 = Who Are You?
