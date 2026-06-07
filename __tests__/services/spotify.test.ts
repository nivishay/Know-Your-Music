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

describe('getArtistTracks', () => {
  it('delegates to lib/spotify/artist-tracks', async () => {
    const mockFetch: typeof globalThis.fetch = async () =>
      new Response(
        JSON.stringify({ tracks: { items: [{ id: '1', name: 'Creep', artists: [{ id: 'a1', name: 'Radiohead' }], preview_url: null, album: { name: 'Pablo Honey', release_date: '1993-02-22', images: [] } }] } }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      )
    const result = await getArtistTracks('Radiohead', 'token-abc', mockFetch)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
  })
})
