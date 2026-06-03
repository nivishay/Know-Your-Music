# Streak mode

## What to build

Endless quiz mode with 3 hearts. Users pick a pool (general or personal), then answer clip after clip. Both questions wrong on a clip costs a heart; at least one correct keeps it. The game ends when all 3 hearts are lost. Clips are fetched in batches of 10; a refill is triggered when 3 clips remain in the buffer.

## Core components touched

- **Services:** extends `services/quiz/generateClips.ts` to support batch-of-10 generation; `services/streaks/heartLogic.ts` (evaluates per-clip outcome: both wrong → lose heart, else → no loss)
- **API:** `GET /api/quiz/streak/batch?mode=<general|personal>` (returns 10 clips with distractors; personal requires auth)
- **Pages:** `app/quiz/streak/page.tsx` (setup screen — pool picker, start button)
- **Components:** `HeartDisplay` (3 hearts, dims on loss), `StreakCounter` (current clip count), `PoolPicker` (general vs personal; personal option hidden for guests)
- **Reuse:** streak gameplay uses the same `AudioPlayer`, `QuestionCard`, `AnswerOptions` components from the core quiz UI

## Acceptance criteria

- [ ] Setup screen shows general pool for all users; personal pool option only shown to logged-in users
- [ ] Starting streak mode loads the first batch of 10 clips
- [ ] When 3 clips remain in the buffer, the next batch is fetched automatically
- [ ] Both questions wrong on a clip → 1 heart lost
- [ ] At least one question correct on a clip → no heart lost
- [ ] Game ends when all 3 hearts are lost; user sees their final clip count
- [ ] Audio player and question UI are identical to the quiz round flow

## Blocked by

02-charts-quiz-end-to-end
