import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/gemini/fun-fact')

import { POST } from '@/app/api/fun-fact/route'
import { getFunFact } from '@/lib/gemini/fun-fact'

describe('POST /api/fun-fact', () => {
  beforeEach(() => vi.resetAllMocks())

  function makeRequest(body: object) {
    return new Request('http://localhost/api/fun-fact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  }

  it('returns { fact } when Gemini succeeds', async () => {
    vi.mocked(getFunFact).mockResolvedValue('A surprising fact about this song.')

    const res = await POST(makeRequest({ song: 'Creep', artist: 'Radiohead', year: '1992' }))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ fact: 'A surprising fact about this song.' })
    expect(getFunFact).toHaveBeenCalledWith('Creep', 'Radiohead', '1992')
  })

  it('returns { fact: null } when Gemini fails (no error to client)', async () => {
    vi.mocked(getFunFact).mockResolvedValue(null)

    const res = await POST(makeRequest({ song: 'Creep', artist: 'Radiohead', year: '1992' }))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ fact: null })
  })
})
