import { describe, it, expect } from 'vitest'
import { pickTrack } from '@/lib/quiz/pool'
import type { SpotifyTrack } from '@/types'

function makeTrack(id: string): SpotifyTrack {
  return {
    id,
    name: `Song ${id}`,
    artists: [{ id: `artist-${id}`, name: `Artist ${id}` }],
    preview_url: null,
    album: { release_date: '2020-01-01' },
  }
}

describe('pickTrack', () => {
  it('returns the first track in the list', () => {
    const tracks = [makeTrack('a'), makeTrack('b')]
    expect(pickTrack(tracks)?.id).toBe('a')
  })

  it('returns null for an empty list', () => {
    expect(pickTrack([])).toBeNull()
  })
})
