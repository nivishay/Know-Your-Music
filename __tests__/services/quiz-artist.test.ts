import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { SpotifyTrack } from '@/types'

vi.mock('@/services/spotify')
vi.mock('@/lib/supabase/server')

import { buildArtistSession, NotEnoughTracksError } from '@/services/quiz'
import { getArtistTracks, getLikedTracks } from '@/services/spotify'
import { createSupabaseAdminClient } from '@/lib/supabase/server'

function makeTrack(id: string, artistName: string, hasPreview = true): SpotifyTrack {
  return {
    id,
    name: `Song ${id}`,
    artists: [{ id: `a-${id}`, name: artistName }],
    preview_url: hasPreview ? `https://preview/${id}` : null,
    album: { name: `Album ${id}`, release_date: '2021-06-01', images: [] },
  }
}

function mockSupabase(sessionId: string) {
  const mockSingle = vi.fn().mockResolvedValue({ data: { id: sessionId }, error: null })
  const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
  const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
  vi.mocked(createSupabaseAdminClient).mockReturnValue({
    from: vi.fn().mockReturnValue({ insert: mockInsert }),
  } as any)
  return { mockInsert }
}

describe('buildArtistSession', () => {
  beforeEach(() => vi.resetAllMocks())

  it('returns a session ID when enough playable tracks exist', async () => {
    vi.mocked(getArtistTracks).mockResolvedValue(
      Array.from({ length: 10 }, (_, i) => makeTrack(String(i), 'Radiohead'))
    )
    vi.mocked(getLikedTracks).mockResolvedValue([
      makeTrack('liked-1', 'Other Artist'),
      makeTrack('liked-2', 'Another Artist'),
      makeTrack('liked-3', 'Third Artist'),
    ])
    mockSupabase('artist-session-1')

    const result = await buildArtistSession('tok', 'Radiohead')

    expect(result).toBe('artist-session-1')
  })

  it('inserts session with mode "artist" and 5 clips', async () => {
    vi.mocked(getArtistTracks).mockResolvedValue(
      Array.from({ length: 10 }, (_, i) => makeTrack(String(i), 'Radiohead'))
    )
    vi.mocked(getLikedTracks).mockResolvedValue(
      Array.from({ length: 5 }, (_, i) => makeTrack(`liked-${i}`, 'Other Artist'))
    )
    const { mockInsert } = mockSupabase('sid')

    await buildArtistSession('tok', 'Radiohead')

    const inserted = mockInsert.mock.calls[0][0]
    expect(inserted.mode).toBe('artist')
    expect(inserted.clips).toHaveLength(5)
  })

  it('throws NotEnoughTracksError when fewer than 5 tracks have a preview_url', async () => {
    vi.mocked(getArtistTracks).mockResolvedValue([
      makeTrack('1', 'Radiohead'),
      makeTrack('2', 'Radiohead'),
      makeTrack('3', 'Radiohead', false),
      makeTrack('4', 'Radiohead', false),
    ])
    vi.mocked(getLikedTracks).mockResolvedValue([])

    await expect(buildArtistSession('tok', 'Radiohead')).rejects.toThrow(NotEnoughTracksError)
  })
})
