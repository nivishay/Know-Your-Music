import { describe, it, expect, vi } from 'vitest'
import { getArtistTracks } from '@/lib/spotify/artist-tracks'
import type { SpotifyTrack } from '@/types'

function makeTrack(id: string, artistName: string): SpotifyTrack {
  return {
    id,
    name: `Song ${id}`,
    artists: [{ id: `a-${id}`, name: artistName }],
    preview_url: `https://preview/${id}`,
    album: { name: 'Album', release_date: '2020-01-01', images: [] },
  }
}

function mockSearch(tracks: SpotifyTrack[]): typeof globalThis.fetch {
  return vi.fn().mockResolvedValue(
    new Response(
      JSON.stringify({ tracks: { items: tracks, next: null, total: tracks.length } }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    ),
  ) as typeof globalThis.fetch
}

describe('getArtistTracks', () => {
  it('calls Spotify search with artist: prefix and bearer token', async () => {
    const fetchFn = mockSearch([makeTrack('1', 'Radiohead')])

    await getArtistTracks('Radiohead', 'my-token', fetchFn)

    expect(fetchFn).toHaveBeenCalledWith(
      expect.stringContaining('q=artist%3ARadiohead'),
      expect.objectContaining({ headers: { Authorization: 'Bearer my-token' } }),
    )
  })

  it('returns only tracks whose primary artist matches the query (case-insensitive)', async () => {
    const tracks = [
      makeTrack('1', 'Radiohead'),
      makeTrack('2', 'radiohead'),      // lowercase variant — should pass
      makeTrack('3', 'Thom Yorke'),     // different artist — filtered out
      makeTrack('4', 'Radiohead feat. Bjork'), // different primary — filtered out
    ]
    const fetchFn = mockSearch(tracks)

    const result = await getArtistTracks('Radiohead', 'tok', fetchFn)

    expect(result.map((t) => t.id)).toEqual(['1', '2'])
  })

  it('returns empty array when search response has no tracks', async () => {
    const fetchFn = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({}), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    ) as typeof globalThis.fetch

    const result = await getArtistTracks('Nobody', 'tok', fetchFn)

    expect(result).toEqual([])
  })
})
