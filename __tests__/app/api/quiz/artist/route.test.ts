import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/headers')
vi.mock('@/services/quiz')

import { POST } from '@/app/api/quiz/artist/route'
import { cookies } from 'next/headers'
import { buildArtistSession, NotEnoughTracksError } from '@/services/quiz'

function mockCookies(token: string | undefined) {
  vi.mocked(cookies).mockResolvedValue({
    get: vi.fn().mockReturnValue(token ? { value: token } : undefined),
  } as any)
}

function makeRequest(body: object) {
  return new Request('http://localhost/api/quiz/artist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/quiz/artist', () => {
  beforeEach(() => vi.resetAllMocks())

  it('returns 401 when no access_token cookie', async () => {
    mockCookies(undefined)
    const res = await POST(makeRequest({ artistName: 'Radiohead' }))
    expect(res.status).toBe(401)
  })

  it('returns { sessionId } on success', async () => {
    mockCookies('tok')
    vi.mocked(buildArtistSession).mockResolvedValue('session-artist-1')

    const res = await POST(makeRequest({ artistName: 'Radiohead' }))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ sessionId: 'session-artist-1' })
    expect(buildArtistSession).toHaveBeenCalledWith('tok', 'Radiohead')
  })

  it('returns 422 with inline error when NotEnoughTracksError is thrown', async () => {
    mockCookies('tok')
    vi.mocked(buildArtistSession).mockRejectedValue(new NotEnoughTracksError())

    const res = await POST(makeRequest({ artistName: 'Radiohead' }))

    expect(res.status).toBe(422)
    const body = await res.json()
    expect(body.error).toContain('Radiohead')
  })
})
