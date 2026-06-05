## What to build

After login, prove the Spotify API integration works. The `/home` page fetches the user's 100 most recent liked songs from `GET /me/tracks` and renders a bare list of track titles and artists on screen.

No quiz UI, no audio — just confirm the API call succeeds, tokens are working, and data reaches the frontend.

## Acceptance criteria

- [ ] `/home` is protected — unauthenticated users are redirected to `/`
- [ ] `GET /me/tracks` is called server-side with the user's access token
- [ ] Up to 100 liked songs are fetched (handle pagination if needed)
- [ ] Track titles and artist names render on the page
- [ ] No crash if the user has fewer than 100 liked songs

## Blocked by

- #01 Basic Spotify Auth
