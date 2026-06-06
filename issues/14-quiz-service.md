## What to build

Create `services/quiz.ts` — the service that builds and persists a quiz session. The API routes delegate to this service; it owns all the orchestration logic.

Expose one function for now:

`buildPersonalSession(token: string): Promise<string>`

Internally it:
1. Calls the Spotify service to fetch the user's liked tracks
2. Filters for tracks that have a `preview_url`
3. Randomly picks 5 (errors if fewer than 5 are available)
4. Builds 2 questions per clip using `lib/quiz/question.ts` — Name That Song + Name That Artist
5. Assembles a `QuizSession` object (`mode: "personal"`, `format: "round"`, all 5 clips)
6. Inserts it into `quiz_sessions` (including the `clips` JSONB column)
7. Returns the new session ID

## Acceptance criteria

- [ ] `services/quiz.ts` exists and exports `buildPersonalSession`
- [ ] Filters out tracks without `preview_url` before picking
- [ ] Throws a typed error if fewer than 5 playable tracks are available
- [ ] Each clip has exactly 2 questions: song name + artist name
- [ ] Session is inserted into DB with `clips` populated
- [ ] Returns the session ID (UUID string)
- [ ] Unit test covers the "fewer than 5 tracks" error path

## Blocked by

- #12 (clips column must exist)
- #13 (Spotify service must exist)
