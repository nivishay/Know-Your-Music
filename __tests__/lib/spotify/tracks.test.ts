import { describe, it, expect, vi } from 'vitest'
import { getLikedTracks } from '@/lib/spotify/tracks'

function makeTracksResponse(count: number, nextUrl: string | null = null) {
  return {
    items: Array.from({ length: count }, (_, i) => ({
      track: {
        id: `track-${i}`,
        name: `Song ${i}`,
        artists: [{ id: `artist-${i}`, name: `Artist ${i}` }],
        preview_url: `https://preview.example.com/${i}`,
        album: { release_date: '2020-01-01' },
      },
    })),
    next: nextUrl,
  }
}

describe('getLikedTracks', () => {
  it('requests limit=50 on the first page', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => makeTracksResponse(10),
    })

    await getLikedTracks('tok', mockFetch)

    expect(mockFetch.mock.calls[0][0]).toContain('limit=50')
  })

  it('calls /me/tracks with Bearer token', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => makeTracksResponse(10),
    })

    await getLikedTracks('access-token-abc', mockFetch)

    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toContain('https://api.spotify.com/v1/me/tracks')
    expect(init.headers.Authorization).toBe('Bearer access-token-abc')
  })

  it('follows pagination to fetch a second page', async () => {
    const page2Url = 'https://api.spotify.com/v1/me/tracks?offset=50&limit=50'
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => makeTracksResponse(50, page2Url),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => makeTracksResponse(50),
      })

    const tracks = await getLikedTracks('tok', mockFetch)

    expect(mockFetch).toHaveBeenCalledTimes(2)
    expect(mockFetch.mock.calls[1][0]).toBe(page2Url)
    expect(tracks).toHaveLength(100)
  })

  it('returns fewer than 100 tracks when the library is small', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => makeTracksResponse(23),
    })

    const tracks = await getLikedTracks('tok', mockFetch)

    expect(tracks).toHaveLength(23)
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('preserves null preview_url — Spotify returns null for many tracks', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [
          {
            track: {
              id: 'track-no-preview',
              name: 'No Preview Song',
              artists: [{ id: 'a1', name: 'Artist' }],
              preview_url: null,
              album: { release_date: '2020-01-01' },
            },
          },
        ],
        next: null,
      }),
    })

    const tracks = await getLikedTracks('tok', mockFetch)

    expect(tracks).toHaveLength(1)
    expect(tracks[0].preview_url).toBeNull()
  })
})
