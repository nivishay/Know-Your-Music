## What to build

Add a `clips` JSONB column to the `quiz_sessions` table via a Supabase migration. This column stores the full pre-built quiz session (all clips, questions, correct answers, and distractors) so sessions can be fetched by ID after creation.

Update the TypeScript database types to include the new column.

## Acceptance criteria

- [ ] Migration file added under `supabase/migrations/`
- [ ] `quiz_sessions.clips` column is JSONB, nullable initially (existing rows have no clips)
- [ ] TypeScript DB types updated to reflect the new column (`clips: Clip[] | null`)
- [ ] Migration applied to local Supabase instance and verified

## Blocked by

None — can start immediately
