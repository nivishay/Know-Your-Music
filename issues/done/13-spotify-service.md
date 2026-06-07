## What to build

Create `services/spotify.ts` — a service wrapper that API routes call to fetch Spotify data. It reads the access token from the incoming request cookies and delegates to the existing `lib/spotify/` functions.

Expose two functions:
- `getLikedTracks(token)` — wraps the existing `lib/spotify/tracks.ts` implementation
- `getArtistTracks(artistId, token)` — stub for the artist quiz (returns empty array until #08 is built)

API routes must not import from `lib/spotify/` directly — all Spotify data access goes through this service.

## Acceptance criteria

- [ ] `services/spotify.ts` exists and exports `getLikedTracks` and `getArtistTracks`
- [ ] `getLikedTracks` delegates to `lib/spotify/tracks.ts` — no logic duplicated
- [ ] `getArtistTracks` is stubbed (returns `[]`) with a TODO comment referencing #08
- [ ] Existing `lib/spotify/tracks.ts` is unchanged
- [ ] No direct imports of `lib/spotify/` from any API route file

## Blocked by

None — can start immediately (parallel with #12)
