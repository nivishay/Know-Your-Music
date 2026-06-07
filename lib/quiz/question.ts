import type { SpotifyTrack, Question } from '@/types'

export function buildSongQuestion(correct: SpotifyTrack, pool: SpotifyTrack[]): Question {
  const distractors = pool
    .filter((t) => t.id !== correct.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map((t) => t.name)

  const options = [...distractors, correct.name].sort(() => Math.random() - 0.5)

  return { correct: correct.name, options }
}

export function buildArtistQuestion(correct: SpotifyTrack, pool: SpotifyTrack[]): Question {
  const correctArtist = correct.artists[0].name
  const distractors = pool
    .filter((t) => t.id !== correct.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map((t) => t.artists[0].name)

  const options = [...distractors, correctArtist].sort(() => Math.random() - 0.5)

  return { correct: correctArtist, options }
}
