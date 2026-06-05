## What to build

After the user answers both questions on a clip, fetch and display a fun fact about that song and artist from Gemini Flash.

The request is fire-and-forget: initiated when both answers are submitted, non-blocking, 3-second timeout. If Gemini is slow or fails, the fun fact section is simply hidden — no error shown to the user.

Prompt: `"Give me 2 punchy, surprising facts about '[song]' by [artist] (released [year]). Max 40 words. Be specific and fun, no fluff."`

Show fun facts in both full quiz rounds and demo mode (Try a Song).

## Acceptance criteria

- [ ] Fun fact appears after both questions on a clip are answered
- [ ] Gemini Flash API called server-side (API key not exposed to client)
- [ ] 3-second timeout enforced — silent failure if exceeded
- [ ] Fun fact section hidden (not an error state) when Gemini fails or times out
- [ ] Works in both full quiz mode and Try a Song demo mode
- [ ] Fun fact covers the song + artist

## Blocked by

- #04 One question (need the "both questions answered" state to exist)
