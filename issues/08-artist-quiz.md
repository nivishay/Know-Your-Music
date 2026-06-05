## What to build

Wire up the Artist Quiz end-to-end. Two entry points on the home screen:
- Tap an artist card from the top 20 strip
- Search for any artist via the search bar above the strip

Both start the same quiz: fetch tracks for the selected artist, filter for `preview_url`, pick 5 randomly, run the standard 2-question-per-clip flow.

Distractors for artist questions: draw from other tracks in the fetched artist pool, supplemented by the user's top artists list.

Fallback: if fewer than 5 preview-able tracks found for the artist, show an inline error on the home screen — "Not enough playable tracks for [Artist] — try another."

## Acceptance criteria

- [ ] Tapping an artist card on `/home` starts an artist quiz for that artist
- [ ] Search bar finds artists not in the top 20 strip
- [ ] Artist quiz runs the same 5-clip, 2-question flow as the Your Music Quiz
- [ ] Distractors use the artist track pool + user's top artists (no extra API calls)
- [ ] Fallback error shown inline if < 5 preview-able tracks found
- [ ] Results page works for artist quiz sessions

## Blocked by

- #06 Home screen and results
- #07 Artist quiz spike
