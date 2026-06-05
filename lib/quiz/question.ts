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
