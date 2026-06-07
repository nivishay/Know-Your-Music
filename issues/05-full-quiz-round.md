## What to build

Build the complete quiz round flow: 5 clips, 2 questions per clip, score at the end.

After the user answers "Name That Song", "Name That Artist" appears (4 artist name options, same distractor approach). After both questions on a clip are answered, the player advances to the next clip. After clip 5, show the final score and score label.

Session state lives client-side — no DB persistence.

Score labels:
| Score | Label |
|---|---|
| 10 | Superfan |
| 8–9 | True Fan |
| 5–7 | Casual Listener |
| 3–4 | Just Passing Through |
| 0–2 | Who Are You? |

## Acceptance criteria

- [ ] 5 clips are sampled from the liked songs pool (only tracks with `preview_url`)
- [ ] Per clip: Name That Song shown first → after answer, Name That Artist appears
- [ ] Score accumulates (1 point per correct answer, max 10)
- [ ] After clip 5, final score and label are shown inline
- [ ] Fallback: if fewer than 5 preview-able tracks exist, show error instead of starting
- [ ] Artist distractors drawn from the same pool (no extra API calls)

## Blocked by

- #04 One question
