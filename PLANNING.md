# Know Your Music — Planning Document

## Concept

A music quiz web app powered by Spotify. Users connect their Spotify account or play as a guest,
and get quizzed on songs and artists through audio clips.

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Frontend + Backend | Next.js + TypeScript | One repo, API routes handle Spotify OAuth and quiz logic, deploys to Vercel |
| Database | Supabase (PostgreSQL) | Free tier, relational model fits users/scores/sessions, works with Vercel |
| Deployment | Vercel | Purpose-built for Next.js, no cold starts, free tier covers MVP |
| Fun Facts | Google Gemini Flash | Free tier (1M tokens/day), real-time generation, fast enough to show after answer |

---

## Authentication & Token Strategy

- Spotify login IS the account — no separate signup
- **Refresh token:** stored encrypted in Supabase on the `users` row
- **Access token:** stored in an HttpOnly cookie with 1-hour TTL
- On each API request: check cookie validity, silently refresh via stored refresh token if expired
- Tokens never exposed to client-side JS

### Guest / General Mode — Server-Side Spotify Credentials
- General mode API calls (charts, genre, artist search) require a server-side Spotify app token
- Use **Client Credentials flow** — cached in memory or a Supabase row, refreshed before expiry
- `getSpotifyAppToken()` singleton utility used by all general-mode API routes
- Personal-mode routes use the user's OAuth token from Supabase instead
- Frontend never touches a Spotify token directly

---

## User Modes

### Guest (no login)
- Access to general mode only
- Scores are session-based — lost on close
- No DB persistence
- CTA to connect Spotify to unlock personal mode

### Connected (Spotify OAuth)
- Access to both general mode and personal mode
- Scores saved to DB (keyed to Spotify user ID)

---

## Quiz Modes

### General Mode (available to everyone)
Three flavors:
1. **Popular charts** — quizzes based on Spotify global trending tracks
2. **Genre picks** — user selects from a curated list of ~15 genres (see below)
3. **Artist/band deep dive** — search bar at top + scrollable curated list of popular artists below

### Personal Mode (Spotify connected only)
- Quizzes drawn from the user's **top tracks** + **liked songs**
- Spotify OAuth scopes needed: `user-top-read`, `user-library-read`
- Pool: ~50 tracks per session — 35 from top tracks + 15 randomly sampled from liked songs
- Filtered to tracks with preview URLs only before building the pool
- If a user has fewer than 15 liked songs with previews, fill remainder from top tracks
- If chosen artist has fewer than 5 tracks with previews: show "Not enough playable tracks — try another"

---

## Quiz Formats

### Daily Challenge
- One song, same for all users each day (Wordle model)
- **Selection:** fetch Spotify global top 50 once per day (cached in Supabase), pick using `day_of_year % 50`
- **Share:** URL share button only — links to `/daily`
- **Replay prevention:** logged-in users blocked via `last_daily_played` date on `users` row; guests via localStorage flag (bypassable, not worth solving in MVP)
- No score saved

### Quiz Round
- 5 clips per round
- Each clip = 2 sequential questions: Name That Song first, then Name That Artist
- 10 possible points per round (2 per clip)
- Score saved to DB for logged-in users
- Final screen shows score + label (see Score Labels)
- All 5 clips + distractors pre-generated upfront in a single server call at round start

### Streak Mode
- Setup screen before starting — user picks general or personal pool (personal only shown if logged in)
- Endless clips, 3 hearts
- Each clip = 2 sequential questions (same as Quiz Round)
- **Heart loss rule:**
  - Both wrong → lose 1 heart
  - At least one correct → no heart lost
- Questions fetched in batches of 10; refill triggered when 3 remain
- Longest streak (highest score before game over) saved to DB for logged-in users

---

## Question Format

Each audio clip presents two questions **sequentially**:
1. **Name That Song** — hear clip, pick song title from 4 options
2. **Name That Artist** — pick artist from 4 options (appears after song answer)

Points: 1 per correct answer. Max 2 per clip.

**No other question types in MVP.** (Song Sequence pushed to v2.)

---

## Score Labels (Quiz Round, out of 10)

| Score | Label |
|---|---|
| 10 | Superfan |
| 8–9 | True Fan |
| 5–7 | Casual Listener |
| 3–4 | Just Passing Through |
| 0–2 | Who Are You? |

---

## Audio

- **Source:** Spotify 30-second preview URLs (~80% track coverage; tracks without previews are skipped)
- **Playback:** Prominent play button always shown — no autoplay (blocked by mobile browsers)
- **Player UI:** Shows zero identifying info — no song title, artist name, or album art
- **Replays:** Unlimited, always
- After first user tap in a session, clips can auto-advance within the same session

---

## Genre Picks — Curated List

~15 genres with clean display names and emoji icons. Hardcoded, maps to valid Spotify genre seeds:

Pop, Hip-Hop, Rock, R&B, Latin, EDM, Country, Jazz, Indie, Metal, K-Pop, Classical, Reggae, Blues, Soul

---

## Wrong Answer (Distractor) Generation

- Source: Spotify `/v1/recommendations` seeded with the correct track/artist
- For **Name That Artist**: extract artist from each recommended track, deduplicate, filter out correct artist
- If fewer than 3 unique wrong artists found: retry up to 2x with different seed track
- If still insufficient after 2 retries: skip that track, pick a different question track
- Server uses app token (Client Credentials) for general mode distractor calls

---

## Fun Facts

- Shown after the user answers both questions on a clip
- Covers the song and the artist
- Generated in real-time by **Gemini Flash**
- Prompt: `"Give me 2 punchy, surprising facts about '[song]' by [artist] (released [year]). Max 40 words. Be specific and fun, no fluff."`
- **3-second timeout** — silent failure if slow or unavailable (fun fact section hidden, no error shown)
- Loads asynchronously, non-blocking

---

## Scoring & Persistence

### Database Schema (MVP — 3 tables)

**`users`**
- `spotify_id`, `refresh_token` (encrypted), `last_daily_played`, `created_at`

**`quiz_sessions`**
- `id`, `user_id`, `mode` (general/personal), `format` (round/streak), `score`, `total_possible`, `created_at`

**`streaks`**
- `user_id`, `longest_streak`

### Persistence Rules
- Quiz Round scores saved to `quiz_sessions` on completion
- Streak Mode high scores saved to `streaks` (longest only)
- Daily challenge: not persisted per user beyond `last_daily_played`
- Quiz history is saved to DB but **not surfaced in any UI in MVP**
- No leaderboards in MVP

### Mid-Quiz Exit
- Progress lost silently — no confirmation dialog
- Browser native `beforeunload` warning not used (inconsistent on mobile)

---

## Routing Structure

| Route | Description |
|---|---|
| `/` | Home — mode picker, login CTA for guests |
| `/daily` | Daily challenge |
| `/quiz/general` | General mode setup (pick flavor: charts / genre / artist) |
| `/quiz/personal` | Personal mode (Spotify required) |
| `/quiz/[sessionId]` | Active quiz round or streak session |
| `/results/[sessionId]` | Score screen + fun facts |
| `/auth/callback` | Spotify OAuth callback |

---

## UI

- **Mobile-first** design
- Big tap targets for 4 answer options
- Prominent play/replay button, no identifying info in player
- Responsive for desktop but phone is the primary surface

---

## Out of Scope for MVP

- Song Sequence question type
- Release year / decade question type
- Quiz history / profile UI (data saved, UI deferred)
- Leaderboards (global or friends)
- Image-based score sharing
- Email/password accounts
- Spotify Premium / full track playback
- Pre-generated / cached fun facts
- Daily login streak tracking
- Difficulty settings

---

## Open Questions for Later

- Difficulty settings (easy = obvious distractors, hard = same-era similar artists)?
- Notification / daily reminder to play the daily challenge?
- Song Sequence question type design?
- Profile / history UI?
