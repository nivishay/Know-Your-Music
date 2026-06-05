import { describe, it, expect } from 'vitest'
import { pickPreviewTrack } from '@/lib/quiz/pool'
import type { SpotifyTrack } from '@/types'

function makeTrack(id: string, previewUrl: string | null): SpotifyTrack {
  return {
    id,
    name: `Song ${id}`,
    artists: [{ id: `artist-${id}`, name: `Artist ${id}` }],
    preview_url: previewUrl,
    album: { release_date: '2020-01-01' },
  }
}

describe('pickPreviewTrack', () => {
  it('returns a track that has a preview_url', () => {
    const tracks = [
      makeTrack('a', null),
      makeTrack('b', 'https://preview.example.com/b'),
    ]
    const result = pickPreviewTrack(tracks)
    expect(result?.preview_url).toBeTruthy()
  })

  it('returns null when no tracks have a preview_url', () => {
    const tracks = [makeTrack('a', null), makeTrack('b', null)]
    expect(pickPreviewTrack(tracks)).toBeNull()
  })
})
