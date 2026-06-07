## What to build

Write and apply RLS policies for the `users` table so each user can only read and write their own row.

The migration file exists at `supabase/migrations/001_initial_schema.sql` with RLS enabled but no policies written. Add the policies there and apply to the Supabase project.

Required policies:
- `SELECT`: user can read their own row (`spotify_id = auth.uid()` or JWT claim equivalent)
- `INSERT`/`UPDATE`: user can only upsert their own row
- Service role bypasses RLS (already the default)

## Acceptance criteria

- [ ] RLS policy added to `users` table: users can only select/insert/update their own row
- [ ] Migration applied to the live Supabase project
- [ ] Auth callback still successfully upserts the user row (uses service role client — bypasses RLS)
- [ ] No user can read another user's refresh token via the public client

## Blocked by

- #01 Basic Spotify Auth
