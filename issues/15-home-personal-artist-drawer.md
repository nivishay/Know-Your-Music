# Home page: Personal Artist drawer + top-artists API

## Parent

`issues/04-home-page.md`

## What to build

Two connected pieces:

**1. `GET /api/me/top-artists` endpoint**
Returns the authenticated user's top Spotify artists using their stored OAuth token (not the app token). Response shape per artist: `{ id, name, imageUrl }`. Returns 401 if no valid access token is present. The result is used only by the Personal Artist drawer — it is not cached server-side.

**2. `PersonalArtistDrawer` component**
A bottom-sheet drawer that opens when the user taps the Personal Artist card on the home page.

- Called lazily: the API is hit only on first open; result is cached in component state for the page lifetime
- Renders the user's top artists as a scrollable list with Spotify artist images and names
- Tapping an artist closes the drawer and immediately starts a personal artist quiz session (`POST /api/quiz/session` with `{ flavor: "artist", mode: "personal", artistId }`) then navigates to `/quiz/[sessionId]`
- Tapping the backdrop or a close affordance dismisses the drawer without starting a session
- Shows a loading state while the top-artists fetch is in flight
- Shows a graceful error state if the fetch fails

## Acceptance criteria

- [ ] `GET /api/me/top-artists` returns 401 when the user is not authenticated
- [ ] `GET /api/me/top-artists` returns a list of artists with `id`, `name`, and `imageUrl` for authenticated users
- [ ] Tapping Personal Artist card on the home page opens the drawer
- [ ] Drawer renders the user's top artists with their Spotify profile images
- [ ] Tapping an artist in the drawer starts a personal artist quiz session and navigates to `/quiz/[sessionId]`
- [ ] Tapping the backdrop closes the drawer without starting a session
- [ ] Drawer is not visible before the Personal Artist card is tapped
- [ ] API route test: 401 for unauthenticated, correct shape for authenticated (Spotify service mocked)
- [ ] `PersonalArtistDrawer` component tests: drawer hidden initially, opens on trigger, artist tap calls correct callback, backdrop tap closes without callback

## Blocked by

- `14-home-auth-toggle` — Personal Artist card must exist in the Personal mode card set
- `07-personal-mode` — `createSession` must support `{ flavor: "artist", mode: "personal", artistId }`
- `03-spotify-oauth` — user OAuth token must be retrievable server-side
