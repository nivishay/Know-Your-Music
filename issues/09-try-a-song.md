## What to build

Demo mode: one clip, both questions, no score, ends with a CTA to start a full quiz.

Uses the same 100 liked songs pool already fetched for the Your Music Quiz — no extra API call. Picks 1 random track with a `preview_url`, plays Name That Song then Name That Artist, shows correct/wrong feedback, then displays a CTA: "Start a full quiz →".

No score, no results page.

## Acceptance criteria

- [ ] "Try a Song" on `/home` starts demo mode
- [ ] Reuses the liked songs pool (no additional Spotify API call)
- [ ] Plays one clip: Name That Song → Name That Artist (sequential)
- [ ] Shows correct/wrong feedback on both questions
- [ ] After both questions answered, CTA appears: "Start a full quiz"
- [ ] CTA navigates to the Your Music Quiz start

## Blocked by

- #06 Home screen and results
