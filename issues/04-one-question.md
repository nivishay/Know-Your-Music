## What to build

Add the first quiz question to the playing song. Below the audio player, show "Name That Song" with 4 answer options — the correct song title plus 3 wrong titles drawn from other tracks in the 100-song pool.

When the user picks an option: highlight correct/wrong, lock the buttons (no re-picking). No next-clip flow yet — this slice is just one question on one song.

## Acceptance criteria

- [ ] 4 answer options shown: 1 correct song title + 3 distractors from the pool
- [ ] Distractors are drawn from other tracks in the same 100-song fetch (no extra API calls)
- [ ] Selecting the correct answer shows a "correct" state on that button
- [ ] Selecting a wrong answer shows "wrong" on picked + reveals the correct one
- [ ] Buttons are locked after any selection (no changing answer)
- [ ] Options are shuffled — correct answer is not always in the same position

## Blocked by

- #03 Play one song
