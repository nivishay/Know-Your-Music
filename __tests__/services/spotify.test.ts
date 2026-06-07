import { describe, it, expect } from 'vitest'
import { getLikedTracks, getArtistTracks } from '@/services/spotify'
import type { SpotifyTrack } from '@/types'

function makeTrack(id: string): SpotifyTrack {
  return {
    id,
    name: `Song ${id}`,
    artists: [{ id: `artist-${id}`, name: `Artist ${id}` }],
    preview_url: `https://preview.example.com/${id}`,
    album: { release_date: '2020-01-01' },
  }
}

// Test 1: getLikedTracks delegates to lib/spotify/tracks via fetchFn
describe('getLikedTracks', () => {
  it('returns tracks fetched from Spotify', async () => {
    const track = makeTrack('1')
    const mockFetch: typeof globalThis.fetch = async () =>
      new Response(
        JSON.stringify({ items: [{ track }], next: null }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    const result = await getLikedTracks('token-abc', mockFetch)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
  })
})

// Test 2: getArtistTracks stub
describe('getArtistTracks', () => {
  it('returns an empty array (stub until #08)', async () => {
    const result = await getArtistTracks('artist-123', 'token-abc')
    expect(result).toEqual([])
  })
})
