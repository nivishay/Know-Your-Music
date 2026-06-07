import type { SpotifyTrack, Question } from '@/types'

export function buildSongQuestion(correct: SpotifyTrack, pool: SpotifyTrack[]): Question {
  const seen = new Set([correct.name])
  const distractors = pool
    .filter((t) => t.id !== correct.id)
    .sort(() => Math.random() - 0.5)
    .reduce<string[]>((acc, t) => {
      if (acc.length < 3 && !seen.has(t.name)) { seen.add(t.name); acc.push(t.name) }
      return acc
    }, [])

  const options = [...distractors, correct.name].sort(() => Math.random() - 0.5)
  return { correct: correct.name, options }
}

export function buildArtistQuestion(correct: SpotifyTrack, pool: SpotifyTrack[]): Question {
  const correctArtist = correct.artists[0].name
  const seen = new Set([correctArtist])
  const distractors = pool
    .filter((t) => t.id !== correct.id)
    .sort(() => Math.random() - 0.5)
    .reduce<string[]>((acc, t) => {
      const name = t.artists[0].name
      if (acc.length < 3 && !seen.has(name)) { seen.add(name); acc.push(name) }
      return acc
    }, [])

  const options = [...distractors, correctArtist].sort(() => Math.random() - 0.5)
  return { correct: correctArtist, options }
}
