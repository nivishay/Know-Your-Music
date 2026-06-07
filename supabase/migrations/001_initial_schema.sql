create table if not exists users (
  spotify_id       text primary key,
  refresh_token    text not null,
  last_daily_played date,
  created_at       timestamptz not null default now()
);

create table if not exists quiz_sessions (
  id              uuid primary key default gen_random_uuid(),
  user_id         text references users(spotify_id) on delete set null,
  mode            text not null check (mode in ('general', 'personal')),
  format          text not null check (format in ('round', 'streak')),
  score           integer not null,
  total_possible  integer not null,
  created_at      timestamptz not null default now()
);

create table if not exists streaks (
  user_id         text primary key references users(spotify_id) on delete cascade,
  longest_streak  integer not null default 0
);

alter table users enable row level security;
alter table quiz_sessions enable row level security;
alter table streaks enable row level security;


-- RLS policies for users table
-- Only the authenticated user can read their own row.
-- auth.uid() matches spotify_id when a custom JWT with the sub claim set to spotify_id is used.
-- All server-side writes use the service role client which bypasses RLS.
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (spotify_id = auth.uid()::text);

CREATE POLICY "users_insert_own" ON users
  FOR INSERT WITH CHECK (spotify_id = auth.uid()::text);

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (spotify_id = auth.uid()::text)
  WITH CHECK (spotify_id = auth.uid()::text);
