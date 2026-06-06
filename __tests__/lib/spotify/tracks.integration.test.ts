/**
 * Smoke test — hits the real Spotify API.
 * Run with a valid access token:
 *   SPOTIFY_TEST_TOKEN=<token> npx vitest run __tests__/lib/spotify/tracks.integration.test.ts
 *
 * Get the token from your browser: DevTools → Application → Cookies → access_token
 */
import { describe, it, expect } from 'vitest'
import { getLikedTracks } from '@/lib/spotify/tracks'

const TOKEN = process.env.SPOTIFY_TEST_TOKEN

describe.skipIf(!TOKEN)('getLikedTracks — real Spotify API', () => {
  it('returns at least one track with a non-null preview_url', async () => {
    const tracks = await getLikedTracks(TOKEN!)
    const withPreview = tracks.filter((t) => t.preview_url != null)

    console.log(`fetched ${tracks.length} tracks, ${withPreview.length} have preview_url`)

    expect(withPreview.length).toBeGreaterThan(0)
  }, 15_000)
})
