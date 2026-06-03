# Fun facts (Gemini)

## What to build

After a user answers both questions on a clip, a fun fact about the song and artist is shown. It is generated in real time by Gemini Flash, called asynchronously so it never blocks quiz progress. If the call takes more than 3 seconds or fails, the section is silently hidden — no error state is shown.

## Core components touched

- **Services:** `services/gemini/funFact.ts` (calls Gemini Flash with prompt `"Give me 2 punchy, surprising facts about '[song]' by [artist] (released [year]). Max 40 words. Be specific and fun, no fluff."`, enforces a 3-second `AbortSignal` timeout, returns `string | null`)
- **API:** `POST /api/fun-fact` (accepts `{ trackId, title, artist, year }`, calls the service, returns `{ fact: string } | {}` on timeout/failure)
- **Components:** `FunFactCard` — added to the quiz UI after both questions on a clip are answered; rendered only when a fact string is returned; hidden (not an error state) if `null`

## Acceptance criteria

- [ ] Fun fact appears after both questions on a clip are answered, without blocking the user from continuing
- [ ] If the Gemini call takes more than 3 seconds, the fun fact section is absent — no spinner, no error message
- [ ] If Gemini returns an error, the section is silently hidden
- [ ] The fun fact card is not shown before both questions are answered

## Blocked by

02-charts-quiz-end-to-end
