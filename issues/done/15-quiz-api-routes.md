## What to build

Wire up two API route handlers. Both are thin — they validate auth, delegate to `services/quiz.ts`, and return a response. No business logic lives in the routes.

**`POST /quiz/personal`**
- Reads `access_token` from request cookies
- Returns 401 if missing
- Calls `buildPersonalSession(token)`
- Returns `{ sessionId }` on success
- Returns 400 with `{ error: "Not enough playable tracks" }` if the service throws the tracks error

**`PATCH /quiz/[sessionId]`**
- Reads `access_token` from request cookies (401 if missing)
- Validates body has `{ score: number, totalPossible: number }`
- Updates `quiz_sessions` row with the final score
- Returns `{ ok: true }`

## Acceptance criteria

- [ ] `POST /quiz/personal` returns `{ sessionId }` for an authenticated user with enough tracks
- [ ] `POST /quiz/personal` returns 401 when no access token cookie is present
- [ ] `POST /quiz/personal` returns 400 when fewer than 5 playable tracks exist
- [ ] `PATCH /quiz/[sessionId]` saves score to DB and returns `{ ok: true }`
- [ ] `PATCH /quiz/[sessionId]` returns 401 when unauthenticated
- [ ] No business logic in the route files — all logic is in `services/quiz.ts`

## Blocked by

- #14 (quiz service must exist)
