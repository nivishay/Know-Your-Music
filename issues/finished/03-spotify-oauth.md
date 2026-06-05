# Spotify OAuth login

## What to build

Full Spotify OAuth login flow: user clicks "Connect Spotify", authenticates with Spotify, is redirected back, and the app stores their refresh token encrypted in Supabase and their access token in an HttpOnly cookie. Subsequent requests silently refresh the access token when expired. Tokens never reach client-side JS.

## Core components touched

- **Services:** `services/auth/spotify.ts` (generate OAuth URL with scopes, exchange code for tokens, refresh access token)
- **API:** `GET /api/auth/login` (redirect to Spotify), `GET /auth/callback` (exchange code, upsert user in DB, set HttpOnly cookie)
- **Middleware:** `middleware.ts` (on every request: check access token cookie validity, silently refresh via stored refresh token if expired, set new cookie)
- **Lib:** `lib/crypto.ts` (encrypt/decrypt refresh token before storing in Supabase), Supabase user upsert (insert or update on `spotify_id`)
- **Scopes required:** `user-top-read`, `user-library-read`

## Acceptance criteria

- [ ] Clicking "Connect Spotify" redirects to Spotify's auth page with correct scopes
- [ ] After authorizing, user is redirected to `/auth/callback` and a `users` row is created or updated in Supabase
- [ ] Refresh token is stored encrypted; access token is in an HttpOnly cookie with 1-hour TTL
- [ ] After the cookie expires, the next request silently refreshes it — user stays logged in without re-authenticating
- [ ] Client-side JS cannot read either token
- [ ] A logged-in user state is detectable server-side on all routes

## Blocked by

01-scaffold
