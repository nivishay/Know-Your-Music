## What to build

Implement the minimal Spotify OAuth flow end-to-end. A visitor clicks "Connect with Spotify", gets redirected to Spotify's auth page, approves permissions, and lands back in the app authenticated.

On callback: exchange the code for tokens, encrypt the refresh token, upsert the user row in Supabase (`users` table — `spotify_id`, `refresh_token`, `created_at`), and store the access token in an HttpOnly cookie (1-hour TTL). Redirect to `/home` on success.

Keep it simple — no middleware, no silent refresh yet. Just the login path working.

Scopes required: `user-top-read`, `user-library-read`

## Acceptance criteria

- [ ] "Connect with Spotify" button on `/` initiates OAuth redirect
- [ ] `/auth/callback` exchanges code for tokens without error
- [ ] Supabase `users` row is created/updated with encrypted refresh token
- [ ] Access token is set as an HttpOnly cookie
- [ ] User lands on `/home` after successful auth
- [ ] Revisiting `/` while already authed redirects to `/home`

## Blocked by

None — can start immediately
