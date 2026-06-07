import { getGeminiModel } from './client'

const TIMEOUT_MS = 5000
export const cache = new Map<string, string>()

export async function getFunFact(song: string, artist: string, year: string): Promise<string | null> {
  const key = `${artist}:${song}`
  if (cache.has(key)) return cache.get(key)!

  try {
    const model = getGeminiModel()
    const prompt = `Give me 2 punchy, surprising facts about '${song}' by ${artist} (released ${year}). Max 40 words. Be specific and fun, no fluff.`

    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), TIMEOUT_MS)
    )
    const result = await Promise.race([
      model.generateContent(prompt).then((r) => r.response.text()),
      timeoutPromise,
    ])

    if (result) cache.set(key, result)
    return result
  } catch (err) {
    console.error('[fun-fact] error:', err)
    return null
  }
}
