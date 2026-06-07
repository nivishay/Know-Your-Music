import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/headers')
vi.mock('@/services/quiz')

import { POST } from '@/app/api/quiz/personal/route'
import { cookies } from 'next/headers'
import { buildPersonalSession, NotEnoughTracksError } from '@/services/quiz'

function mockCookies(token: string | undefined) {
  vi.mocked(cookies).mockResolvedValue({
    get: vi.fn().mockReturnValue(token ? { value: token } : undefined),
  } as any)
}

describe('POST /api/quiz/personal', () => {
  beforeEach(() => vi.resetAllMocks())

  it('returns 401 when no access_token cookie', async () => {
    mockCookies(undefined)
    const res = await POST(new Request('http://localhost/api/quiz/personal', { method: 'POST' }))
    expect(res.status).toBe(401)
  })

  it('returns { sessionId } on success', async () => {
    mockCookies('tok')
    vi.mocked(buildPersonalSession).mockResolvedValue('session-xyz')
    const res = await POST(new Request('http://localhost/api/quiz/personal', { method: 'POST' }))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ sessionId: 'session-xyz' })
  })

  it('returns 400 with error message when NotEnoughTracksError is thrown', async () => {
    mockCookies('tok')
    vi.mocked(buildPersonalSession).mockRejectedValue(new NotEnoughTracksError())
    const res = await POST(new Request('http://localhost/api/quiz/personal', { method: 'POST' }))
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'Not enough playable tracks' })
  })
})
