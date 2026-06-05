import { describe, it, expect } from 'vitest'
import { buildSongQuestion } from '@/lib/quiz/question'
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

const pool = Array.from({ length: 10 }, (_, i) => makeTrack(String(i)))
const correct = pool[0]

describe('buildSongQuestion', () => {
  it('returns exactly 4 options', () => {
    const q = buildSongQuestion(correct, pool)
    expect(q.options).toHaveLength(4)
  })

  it('correct track name is in options and in .correct', () => {
    const q = buildSongQuestion(correct, pool)
    expect(q.correct).toBe(correct.name)
    expect(q.options).toContain(correct.name)
  })

  it('all options are unique', () => {
    const q = buildSongQuestion(correct, pool)
    expect(new Set(q.options).size).toBe(4)
  })

  it('distractors are drawn from other tracks in the pool', () => {
    const q = buildSongQuestion(correct, pool)
    const poolNames = new Set(pool.map((t) => t.name))
    for (const option of q.options) {
      expect(poolNames).toContain(option)
    }
    const distractors = q.options.filter((o) => o !== correct.name)
    expect(distractors).toHaveLength(3)
    for (const d of distractors) {
      expect(d).not.toBe(correct.name)
    }
  })
})
