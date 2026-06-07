## What to build

Refactor the quiz page into a server component shell + a `<QuizClient />` client component that owns all interactive state.

**Server component (`app/quiz/[sessionId]/page.tsx`)**
- Reads `access_token` cookie — redirects to `/` if missing
- Fetches the session from DB by `sessionId` — shows 404 if not found
- Passes the full `QuizSession` (with all clips) to `<QuizClient />`

**Client component (`components/QuizClient.tsx`)**
- Receives the full `QuizSession` as a prop
- Tracks current clip index, current question index, and running score in React state
- Renders `<SpotifyPlayer>` and `<SongQuestion>` for the active clip/question
- After the user answers, advances to the next question or next clip
- After clip 5, question 2 is answered: calls `PATCH /quiz/[sessionId]` with final score, then shows the results screen inline (score + label from issue #05 label table)

## Acceptance criteria

- [ ] Quiz page is a server component that reads session from DB (no inline quiz logic)
- [ ] `<QuizClient />` receives `QuizSession` as a prop and manages all state
- [ ] Progresses through 5 clips × 2 questions correctly (no skipping, no double-advancing)
- [ ] Score increments on correct answers only
- [ ] Final score is sent via `PATCH /quiz/[sessionId]` before showing results
- [ ] Results screen shows score and the correct label (Superfan / True Fan / etc.)
- [ ] Fallback rendered if `sessionId` is not found in DB

## Blocked by

- #15 (API routes must exist)
