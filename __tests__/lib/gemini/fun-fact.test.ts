import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/gemini/client')

import { getFunFact, cache } from '@/lib/gemini/fun-fact'
import { getGeminiModel } from '@/lib/gemini/client'

function mockModel(textResult: string): ReturnType<typeof vi.fn>
function mockModel(opts: { throws: Error }): ReturnType<typeof vi.fn>
function mockModel(opts: { delayMs: number }): ReturnType<typeof vi.fn>
function mockModel(arg: string | { throws: Error } | { delayMs: number }) {
  let generateContent: ReturnType<typeof vi.fn>

  if (typeof arg === 'string') {
    generateContent = vi.fn().mockResolvedValue({ response: { text: () => arg } })
  } else if ('throws' in arg) {
    generateContent = vi.fn().mockRejectedValue(arg.throws)
  } else {
    generateContent = vi.fn().mockImplementation(
      () => new Promise((resolve) =>
        setTimeout(() => resolve({ response: { text: () => 'late' } }), arg.delayMs)
      )
    )
  }

  vi.mocked(getGeminiModel).mockReturnValue({ generateContent } as any)
  return generateContent
}

describe('getFunFact', () => {
  beforeEach(() => { vi.resetAllMocks(); cache.clear() })

  it('returns fact text when Gemini responds', async () => {
    const generateContent = mockModel('Recorded in one take. The guitar riff took 20 minutes.')

    const result = await getFunFact('Shake It Off', 'Taylor Swift', '2014')

    expect(result).toBe('Recorded in one take. The guitar riff took 20 minutes.')
    expect(generateContent).toHaveBeenCalledWith(
      expect.stringContaining("'Shake It Off' by Taylor Swift (released 2014)")
    )
  })

  it('returns null when Gemini throws', async () => {
    mockModel({ throws: new Error('API error') })

    const result = await getFunFact('Shake It Off', 'Taylor Swift', '2014')

    expect(result).toBeNull()
  })

  it('returns null when Gemini takes longer than the timeout', async () => {
    vi.useFakeTimers()
    mockModel({ delayMs: 10000 })

    const promise = getFunFact('Shake It Off', 'Taylor Swift', '2014')
    vi.advanceTimersByTime(5001)
    const result = await promise

    expect(result).toBeNull()
    vi.useRealTimers()
  })
})
