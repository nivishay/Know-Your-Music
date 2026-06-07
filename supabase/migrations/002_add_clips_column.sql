-- Add clips JSONB column to store the full pre-built quiz session data.
-- Nullable so existing rows are unaffected.
ALTER TABLE quiz_sessions ADD COLUMN IF NOT EXISTS clips JSONB;
