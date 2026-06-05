# Homepage redesign: guest Daily Challenge hero + authenticated General/Personal toggle

## Problem Statement

The current home page presents every quiz mode as a flat list of tiles for all users. Guests have no immediate reason to engage — they see mode cards but no ready-to-play experience. Logged-in users have no way to switch between playing with their own Spotify library (Personal mode) versus generic tracks (General mode). The page treats all users identically when their needs are fundamentally different.

## Solution

The home page (`/`) renders a different experience based on authentication state, all within the same route.

**For guests:** A Daily Challenge hero section sits at the top — the day's song is pre-loaded and a prominent play button is immediately visible. Below it are the General mode cards (Charts, Genre, Artist, Streak). A login CTA at the bottom explains what connecting Spotify unlocks (Personal mode).

**For authenticated users:** A top-level General | Personal toggle replaces the flat card list. The toggle defaults to Personal. Each mode shows only the cards that are relevant to that pool. The Daily Challenge card is always visible regardless of the selected mode (with a "General" badge when Personal is active).

## User Stories

1. As a guest, I want to see a playable Daily Challenge the moment I arrive on the site, so that I can engage immediately without creating an account.
2. As a guest, I want a clearly visible play button on the Daily Challenge hero, so that I know exactly how to start playing.
3. As a guest, I want the Daily Challenge to start immediately on tap without a loading screen, so that the experience feels instant.
4. As a guest, I want to see the General mode cards (Charts, Genre, Artist, Streak) below the hero section, so that I know there are more ways to play.
5. As a guest, I want a clear explanation of what connecting Spotify unlocks, so that I understand the value of signing in before I commit to it.
6. As a guest, I want to play General mode quiz modes without creating an account, so that I can try the app before committing.
7. As an authenticated user, I want to land on my Personal mode by default, so that I immediately see the experience I signed up for.
8. As an authenticated user, I want a clearly labelled General | Personal toggle at the top of the page, so that I can easily switch between my music and a general pool.
9. As an authenticated user in Personal mode, I want to see Artist and Streak mode cards, so that I can play with tracks from my own library.
10. As an authenticated user in General mode, I want to see Charts, Genre, Artist, Streak, and Daily Challenge cards, so that I have access to all general-pool quiz types.
11. As an authenticated user in Personal mode, I want to see the Daily Challenge card even though it is a General-only experience, so that I never miss the daily habit loop.
12. As an authenticated user, I want the Daily Challenge card in Personal mode to be clearly marked as "General", so that I understand why it draws from a shared pool rather than my library.
13. As an authenticated user, I want to tap Personal Artist and immediately see my top Spotify artists in a drawer, so that I can pick one without navigating away from the home page.
14. As an authenticated user, I want my top artists shown with their Spotify profile images, so that the picker looks polished and is easy to scan.
15. As an authenticated user, I want tapping an artist in the drawer to immediately start a quiz session, so that the flow from "pick artist" to "playing" is seamless.
16. As an authenticated user, I want the artist drawer to slide up from the bottom of the screen, so that the interaction feels native on mobile.
17. As an authenticated user, I want the artist drawer to be dismissible without starting a session, so that I can change my mind.
18. As an authenticated user in General mode, I want to tap the Artist card and see the existing search/curated-list experience (not my personal artists), so that General and Personal Artist modes feel distinct.
19. As a returning authenticated user, I want my last-selected General/Personal toggle state to be remembered, so that I do not have to re-select it every visit.

## Implementation Decisions

- **Same `/` route, two render paths.** The server component checks authentication and passes `isAuthenticated` (and, when authenticated, the user's Spotify user ID) down to `HomePageClient`. No separate `/home` route or redirect after login.

- **Daily Challenge session pre-generated server-side for guests.** The server component fetches or generates the daily session before rendering, so the hero section can immediately navigate to `/quiz/[sessionId]` on tap — no loading state on the hero button.

- **`HomePageClient` receives a `dailySessionId` prop** (always populated) and an `isAuthenticated` prop. When authenticated, it also receives the user identity needed to request personal-mode data.

- **General | Personal toggle is client-side state** in `HomePageClient`, defaulting to `"personal"` for authenticated users. Toggle state is persisted in `localStorage` so returning users land in their last-selected mode.

- **General mode card set:** Charts, Genre, Artist, Streak, Daily Challenge.

- **Personal mode card set:** Artist (personal), Streak (personal), Daily Challenge (with "General" badge). Genre is General-only in this version.

- **Daily Challenge card** renders identically in both toggle states; when rendered inside the Personal mode view it carries a visible "General" badge to signal the exception.

- **Personal Artist picker** is a bottom drawer component. It opens when the user taps the Personal Artist card and is dismissed by tapping the backdrop or a close affordance. On artist selection it immediately calls `POST /api/quiz/session` with `{ flavor: "artist", mode: "personal", artistId }` and navigates to `/quiz/[sessionId]`.

- **New API endpoint `GET /api/me/top-artists`** returns the authenticated user's top Spotify artists (name, Spotify artist ID, image URL). It uses the user's stored OAuth token (not the app token). It is called lazily — only when the user opens the Personal Artist drawer for the first time in a session; the result is cached in component state for the lifetime of the page.

- **`createSession` extended** to accept `mode: "personal"` and `flavor: "artist"` with an `artistId`. Personal Artist sessions draw clips from the user's Spotify library tracks for that artist, filtered to tracks with preview URLs.

- **No new DB schema changes** for this feature. Sessions continue to use the existing `quiz_sessions` table with `mode: "personal"`.

## Testing Decisions

Good tests assert observable behavior — what the component renders and how it responds to user interaction — not internal state or implementation details like which hooks are called.

**`HomePageClient` (existing test file, expand coverage):**
- Guest view renders the Daily Challenge hero with a play button.
- Guest view renders all four General mode cards below the hero.
- Guest view renders the Spotify connect CTA.
- Authenticated view renders the General/Personal toggle.
- Authenticated view defaults to Personal mode and shows Artist + Streak + Daily.
- Switching toggle to General shows Charts, Genre, Artist, Streak, Daily.
- Daily Challenge card is visible in Personal mode and carries a "General" badge.
- Authenticated view does not render the Spotify connect CTA.
- Prior art: `app/HomePageClient.test.tsx` — render + `screen.getBy*` assertions via Testing Library.

**`PersonalArtistDrawer` (new component test):**
- Drawer is not visible before the Personal Artist card is tapped.
- Tapping the Personal Artist card opens the drawer.
- Drawer renders a list of artists with names and images sourced from the prop data.
- Tapping an artist calls the provided `onSelect` callback with the artist ID.
- Tapping the backdrop closes the drawer without calling `onSelect`.
- Prior art: same RTL + vitest pattern as `HomePageClient.test.tsx`.

**`GET /api/me/top-artists` (new route test):**
- Returns 401 when no valid access token is present.
- Returns a list of artists (name, id, imageUrl) when a valid token is present and the Spotify service returns data.
- Mocks the Spotify top-artists service at the same boundary used by the session route tests.
- Prior art: `app/api/quiz/session/route.test.ts` — `@vitest-environment node`, mock the service layer, assert HTTP status and response shape.

## Out of Scope

- Personal Genre mode (genre quiz drawn from the user's listening history) — deferred to a future issue.
- Leaderboards or social features on the home page.
- Notification or daily-reminder prompts.
- Profile or history UI linked from the home page.
- Difficulty settings.
- Image-based score sharing.

## Further Notes

- The Daily Challenge hero on the guest landing page creates the core conversion funnel: guest plays one song → gets hooked → sees CTA → connects Spotify to unlock Personal mode and full General access.
- The Personal Artist drawer using Spotify artist images (fetched via the Spotify API) is important for the premium feel of the personal experience — the images make the picker feel native to Spotify rather than a plain list.
- The toggle defaulting to Personal is intentional: authenticated users connected Spotify specifically to get their personalised experience. General mode is one tap away.
- Replay prevention for the Daily Challenge on the guest hero follows the same rules as the existing `/daily` route: guests use a `localStorage` flag (bypassable; acceptable for MVP).
