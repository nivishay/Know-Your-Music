import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/headers')
vi.mock('@/lib/supabase/server')

import { PATCH } from '@/app/api/quiz/[sessionId]/route'
import { cookies } from 'next/headers'
import { createSupabaseAdminClient } from '@/lib/supabase/server'

function mockCookies(token: string | undefined) {
  vi.mocked(cookies).mockResolvedValue({
    get: vi.fn().mockReturnValue(token ? { value: token } : undefined),
  } as any)
}

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/quiz/some-id', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('PATCH /api/quiz/[sessionId]', () => {
  beforeEach(() => vi.resetAllMocks())

  it('returns 401 when no access_token cookie', async () => {
    mockCookies(undefined)
    const res = await PATCH(makeRequest({ score: 8, totalPossible: 10 }), {
      params: Promise.resolve({ sessionId: 'some-id' }),
    })
    expect(res.status).toBe(401)
  })

  it('updates score and returns { ok: true }', async () => {
    mockCookies('tok')
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    vi.mocked(createSupabaseAdminClient).mockReturnValue({
      from: vi.fn().mockReturnValue({ update: mockUpdate }),
    } as any)

    const res = await PATCH(makeRequest({ score: 8, totalPossible: 10 }), {
      params: Promise.resolve({ sessionId: 'some-id' }),
    })
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
    expect(mockUpdate).toHaveBeenCalledWith({ score: 8, total_possible: 10 })
    expect(mockEq).toHaveBeenCalledWith('id', 'some-id')
  })
})
