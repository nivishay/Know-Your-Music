# Know Your Music — Planning Document

## Concept

A music quiz web app powered by Spotify. Users connect their Spotify account and get quizzed
on their own music — songs they've liked, artists they love.

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Frontend + Backend | Next.js + TypeScript | One repo, API routes handle Spotify OAuth and quiz logic, deploys to Vercel |
| Database | Supabase (PostgreSQL) | Free tier, stores user auth tokens, works with Vercel |
| Deployment | Vercel | Purpose-built for Next.js, no cold starts, free tier covers MVP |
| Fun Facts | Google Gemini Flash | Free tier (1M tokens/day), real-time generation, fast enough to show after answer |

---

## Authentication & Token Strategy

- Spotify login IS the account — no separate signup, no guest mode
- **Refresh token:** stored encrypted in Supabase on the `users` row
- **Access token:** stored in an HttpOnly cookie with 1-hour TTL
- On each API request: check cookie validity, silently refresh via stored refresh token if expired
- Tokens never exposed to client-side JS
- Scopes required: `user-top-read`, `user-library-read`

---

## User Flow

1. Visitor hits the site → sees minimal landing page (app name + tagline + "Connect with Spotify" button)
2. After Spotify OAuth → lands on home screen
3. Home screen shows three quiz entry points (see Quiz Modes below)
4. User picks a mode → quiz starts → results page on completion

---

## Home Screen Layout

Three sections, mobile-first:

1. **"How well do you know your music?"** — primary card, launches a 5-song quiz from liked songs
2. **Artist cards** — scrollable horizontal strip of user's top 20 artists (from `GET /me/top/artists`)
   - Each card = "How well do you know [Artist]?"
   - Search bar above the strip to find any artist (not just top 20)
3. **"Try a song"** — single-song demo mode, no score

---

## Quiz Modes

### Your Music Quiz
- Pool: fetch most recent **100 liked songs** (`GET /me/tracks`), filter to tracks with `preview_url`
- Randomly sample 5 from the filtered pool
- Fallback: if fewer than 5 tracks have preview URLs → show error: *"Not enough playable tracks in your library"*

### Artist Quiz
- Entry point A: tap a card from the top 20 artist strip
- Entry point B: search any artist via search bar
- Track source: `GET /search?q={artist}&type=track`, filter for `preview_url`, pick 5 randomly

> **⚠️ Validation spike required before building:** confirm that search-based track fetching
> for a given artist reliably returns 5+ tracks with `preview_url`. Test before implementing.

- Fallback: if fewer than 5 preview-able tracks found → inline error on home screen: *"Not enough playable tracks for [Artist] — try another"*

### Try a Song (Demo Mode)
- Pool: liked songs (same 100 fetched for Your Music Quiz — reuse, no extra API call)
- Picks 1 random track with `preview_url`
- Plays both questions (Name That Song + Name That Artist)
- Shows fun fact after answer
- No score, no results page — ends with a CTA to start a full quiz

---

## Question Format

Each audio clip presents two questions **sequentially**:
1. **Name That Song** — hear clip, pick song title from 4 options
2. **Name That Artist** — pick artist from 4 options (appears after song answer)

Points: 1 per correct answer. Max 2 per clip. Max 10 per full quiz round.

**No other question types in MVP.**

---

## Wrong Answer (Distractor) Generation

**MVP: pool-based distractors**
- Wrong song titles and wrong artist names are drawn from other tracks in the same fetched pool
- For Your Music Quiz: distractors come from the other ~95 songs in the liked songs pool
- For Artist Quiz: distractors come from other tracks fetched for that artist, supplemented by user's top artists list
- Zero extra API calls — all data already in memory

> **V2 note:** Replace with smarter distractors — same era, same genre, contextually similar artists —
> so wrong answers are believable and difficulty scales appropriately.

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

## Results Page

- Separate route: `/results/[sessionId]`
- Shows: score, score label, song-by-song breakdown
- CTAs: "Play again", "Try another artist", "Back to home"

---

## Audio

- **Source:** Spotify 30-second preview URLs (~80% track coverage; tracks without previews are skipped)
- **Playback:** Prominent play button always shown — no autoplay (blocked by mobile browsers)
- **Player UI:** Shows zero identifying info — no song title, artist name, or album art
- **Replays:** Unlimited, always
- After first user tap in a session, clips can auto-advance within the same session

---

## Fun Facts

- Shown after the user answers both questions on a clip
- Covers the song and the artist
- Generated in real-time by **Gemini Flash**
- Prompt: `"Give me 2 punchy, surprising facts about '[song]' by [artist] (released [year]). Max 40 words. Be specific and fun, no fluff."`
- **3-second timeout** — silent failure if slow or unavailable (fun fact section hidden, no error shown)
- Loads asynchronously, non-blocking
- Shown in demo mode (Try a Song) as well as full quiz rounds

---

## Database Schema (MVP — 1 table)

**`users`**
- `spotify_id`, `refresh_token` (encrypted), `created_at`

No quiz session persistence in MVP. Added when profile/history UI is built in v2.

### Mid-Quiz Exit
- Progress lost silently — no confirmation dialog

---

## Routing Structure

| Route | Description |
|---|---|
| `/` | Landing page for unauthenticated users (tagline + Spotify connect button) |
| `/home` | Home screen — quiz mode picker (requires auth) |
| `/quiz/[sessionId]` | Active quiz round |
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

- Guest / general mode
- Daily challenge
- Streak mode
- Song Sequence question type
- Release year / decade question type
- Quiz history / profile UI
- Leaderboards (global or friends)
- Image-based score sharing
- Email/password accounts
- Spotify Premium / full track playback
- Pre-generated / cached fun facts
- Difficulty settings
- Smart distractors (same era / genre)
- Quiz session persistence (`quiz_sessions` table)

---

## V2 Roadmap

- **Streak mode** — endless clips, 3 hearts, high score saved to DB
- **Smart distractors** — same era, same genre, contextually similar to correct answer
- **Quiz session persistence** — `quiz_sessions` table, history UI, profile page
- **Daily challenge** — Wordle-style, one song per day for all users
- **Score sharing** — image card or URL share
- **Difficulty settings** — easy (obvious distractors) vs hard (same-era similar artists)
- **Song Sequence** question type

---

## Open Questions

- Which Spotify app dev-mode limitations apply once we have real users? (25-user limit in dev mode — need quota extension for public launch)
- Artist search UX: search-as-you-type or submit button?
