# Artist mode

## What to build

Users can search for an artist or pick from a curated scrollable list and be quizzed on that artist's tracks. A search bar sits at the top; a curated list of popular artists sits below for discoverability without typing.

## Core components touched

- **Data:** `lib/curatedArtists.ts` (hardcoded list of popular artists with name and Spotify artist ID)
- **Services:** `services/spotify/artistSearch.ts` (call Spotify `/v1/search?type=artist`, return top matches)
- **API:** `GET /api/artists/search?q=<query>` (proxies Spotify search, uses app token), extends `POST /api/quiz/session` with `mode=artist&artistId=<id>` — sources tracks from the artist's top tracks or albums, filters to preview URLs
- **Pages:** `app/quiz/general/page.tsx` (artist step in the general mode setup flow)
- **Components:** `ArtistSearchBar`, `ArtistList`, `ArtistCard` (name + image)
- **Error path:** if the selected artist has fewer than 5 tracks with preview URLs, return an error and show "Not enough playable tracks — try another artist"

## Acceptance criteria

- [ ] Artist search returns results as the user types (debounced)
- [ ] Curated artist list is visible below the search bar without typing
- [ ] Selecting an artist and starting a quiz returns 5 clips from that artist's tracks
- [ ] If an artist has fewer than 5 tracks with preview URLs, the user sees a clear error and can pick a different artist
- [ ] Quiz plays through identically to the charts flow

## Blocked by

02-charts-quiz-end-to-end, 04-home-page
