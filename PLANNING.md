# Know Your Music — Planning Document

## Concept

A music quiz web app powered by Spotify. Users connect their Spotify account or play as a guest,
and get quizzed on songs, artists, and genres through audio clips.

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Frontend + Backend | Next.js + TypeScript | One repo, API routes handle Spotify OAuth and quiz logic, deploys to Vercel |
| Database | Supabase (PostgreSQL) | Free tier, relational model fits users/scores/sessions, works with Vercel |
| Deployment | Vercel | Purpose-built for Next.js, no cold starts, free tier covers MVP |
| Fun Facts | Google Gemini Flash | Free tier (1M tokens/day), real-time generation, fast enough to show after answer |

---

## User Modes

### Guest (no login)
- Access to general mode only
- Scores are session-based — lost on close
- No DB persistence needed
- CTA to connect Spotify to unlock personal mode

### Connected (Spotify OAuth)
- Access to both general mode and personal mode
- Scores and quiz history saved to DB (keyed to Spotify user ID)
- Spotify login IS the account — no separate signup

---

## Quiz Modes

### General Mode (available to everyone)
Three flavors:
1. **Popular charts** — quizzes based on Spotify global trending tracks
2. **Genre picks** — user selects a genre, quizzed on popular tracks from it
3. **Artist/band deep dive** — "How well do you know Taylor Swift?" style

### Personal Mode (Spotify connected only)
- Quizzes drawn from the user's **top tracks** + **liked songs**
- Spotify OAuth scopes needed: `user-top-read`, `user-library-read`

---

## Quiz Formats

### Daily Challenge
- One song, same for all users each day (Wordle model)
- Cached for 24 hours
- Text-based share button: "I got today's Know Your Music in 1 try 🎵"
- No score saved (casual, single question)

### Quiz Round
- 5 questions per round (MVP)
- Score saved to DB for logged-in users
- Final screen shows score + fun label ("Superfan", "Casual Listener", etc.)

### Streak Mode
- Endless questions
- 3 hearts — lose one per wrong answer, game over at 0
- Longest streak saved for logged-in users

---

## Question Types (MVP)

| # | Type | Description |
|---|---|---|
| 1 | Name that song | Hear a 30-sec clip, pick the song title (4 options) |
| 2 | Name that artist | Hear a 30-sec clip, pick the artist (4 options) |
| 6 | Song sequence | Hear 5 clips in a row, identify each one |

**Pushed to v2:** Release year / decade questions

---

## Audio

- **Source:** Spotify 30-second preview URLs (free, ~80% track coverage, tracks without previews are skipped)
- **Playback:** Autoplay when question loads
- **Replays:** Unlimited, always

---

## Multiple Choice — Wrong Answer Generation

- Source: Spotify `/v1/recommendations` endpoint (seeded with the correct track/artist)
- Returns similar artists/tracks in the same genre, era, and market (language-safe)
- No extra API calls needed — Spotify handles similarity logic

---

## Fun Facts

- Shown after the user answers each question
- Covers both the **song** and the **artist**
- Generated in real-time by **Gemini Flash**
- Prompt format: `"Give me 2 punchy, surprising facts about '[song]' by [artist] (released [year]). Max 40 words. Be specific and fun, no fluff."`
- Data source: Gemini's own training knowledge (no Wikipedia/Last.fm fetch — simpler, fast enough for popular tracks)
- Loads asynchronously alongside the result screen (non-blocking)

---

## Scoring & Persistence

- No leaderboards in MVP
- Logged-in users see their own quiz history and scores
- Guest users see nothing persisted

---

## UI

- **Mobile-first** design
- Big tap targets for 4 answer options
- Prominent play/replay button
- Responsive for desktop but phone is the primary surface

---

## Out of Scope for MVP

- Release year / decade question type
- Leaderboards (global or friends)
- Image-based score sharing
- Email/password accounts
- Spotify Premium / full track playback
- Pre-generated / cached fun facts

---

## Open Questions for Later

- How many songs pool for daily challenge? (global top 50? top 200?)
- Difficulty settings (easy = obvious distractors, hard = same-era similar artists)?
- Notification / daily reminder to play the daily challenge?
