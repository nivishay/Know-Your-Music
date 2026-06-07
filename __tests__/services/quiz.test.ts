import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { SpotifyTrack } from '@/types'

vi.mock('@/services/spotify')
vi.mock('@/lib/supabase/server')

import { buildPersonalSession, NotEnoughTracksError } from '@/services/quiz'
import { getLikedTracks } from '@/services/spotify'
import { createSupabaseAdminClient } from '@/lib/supabase/server'

function makeTrack(id: string, hasPreview = true): SpotifyTrack {
  return {
    id,
    name: `Song ${id}`,
    artists: [{ id: `artist-${id}`, name: `Artist ${id}` }],
    preview_url: hasPreview ? `https://preview.example.com/${id}` : null,
    album: { name: `Album ${id}`, release_date: '2020-01-01', images: [] },
  }
}

describe('buildPersonalSession', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('throws NotEnoughTracksError when fewer than 5 tracks have a preview_url', async () => {
    vi.mocked(getLikedTracks).mockResolvedValue([
      makeTrack('1'),
      makeTrack('2'),
      makeTrack('3'),
      makeTrack('no-preview-1', false),
      makeTrack('no-preview-2', false),
    ])

    await expect(buildPersonalSession('token')).rejects.toThrow(NotEnoughTracksError)
  })

  it('returns the session ID after building and inserting a session', async () => {
    const tracks = Array.from({ length: 10 }, (_, i) => makeTrack(String(i)))
    vi.mocked(getLikedTracks).mockResolvedValue(tracks)

    const mockSingle = vi.fn().mockResolvedValue({ data: { id: 'session-uuid-123' }, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    vi.mocked(createSupabaseAdminClient).mockReturnValue({
      from: vi.fn().mockReturnValue({ insert: mockInsert }),
    } as any)

    const sessionId = await buildPersonalSession('token')
    expect(sessionId).toBe('session-uuid-123')
  })

  it('inserts exactly 5 clips regardless of pool size', async () => {
    const tracks = Array.from({ length: 20 }, (_, i) => makeTrack(String(i)))
    vi.mocked(getLikedTracks).mockResolvedValue(tracks)

    let capturedInsert: unknown
    const mockSingle = vi.fn().mockResolvedValue({ data: { id: 'sid' }, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockImplementation((row) => {
      capturedInsert = row
      return { select: mockSelect }
    })
    vi.mocked(createSupabaseAdminClient).mockReturnValue({
      from: vi.fn().mockReturnValue({ insert: mockInsert }),
    } as any)

    await buildPersonalSession('token')

    const clips = (capturedInsert as { clips: unknown[] }).clips
    expect(clips).toHaveLength(5)
  })
})
