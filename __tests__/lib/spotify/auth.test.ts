import { describe, it, expect, vi } from 'vitest'
import { buildAuthUrl, encryptToken, decryptToken, exchangeCode, getSpotifyProfile } from '@/lib/spotify/auth'

const testConfig = {
  clientId: 'test-client-id',
  redirectUri: 'http://localhost:3000/auth/callback',
}

const TEST_SECRET = 'a'.repeat(32) // 32-byte key for AES-256

describe('exchangeCode', () => {
  it('POSTs to the Spotify token endpoint with correct params', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: 'acc123',
        refresh_token: 'ref456',
      }),
    })

    await exchangeCode('auth-code', {
      clientId: 'test-client-id',
      clientSecret: 'test-secret',
      redirectUri: 'http://localhost:3000/auth/callback',
      fetch: mockFetch,
    })

    expect(mockFetch).toHaveBeenCalledOnce()
    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toBe('https://accounts.spotify.com/api/token')
    expect(init.method).toBe('POST')

    const body = new URLSearchParams(init.body)
    expect(body.get('grant_type')).toBe('authorization_code')
    expect(body.get('code')).toBe('auth-code')
    expect(body.get('redirect_uri')).toBe('http://localhost:3000/auth/callback')
  })

  it('returns accessToken and refreshToken on success', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: 'acc123',
        refresh_token: 'ref456',
      }),
    })

    const result = await exchangeCode('auth-code', {
      clientId: 'test-client-id',
      clientSecret: 'test-secret',
      redirectUri: 'http://localhost:3000/auth/callback',
      fetch: mockFetch,
    })

    expect(result).toEqual({ accessToken: 'acc123', refreshToken: 'ref456' })
  })
})

describe('getSpotifyProfile', () => {
  it('returns spotify_id from /me endpoint', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'spotify-user-123' }),
    })

    const profile = await getSpotifyProfile('access-token-abc', mockFetch)

    expect(profile.id).toBe('spotify-user-123')
    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toBe('https://api.spotify.com/v1/me')
    expect(init.headers.Authorization).toBe('Bearer access-token-abc')
  })
})

describe('encryptToken / decryptToken', () => {
  it('round-trips a refresh token', () => {
    const token = 'AQD_someRefreshToken123'
    const encrypted = encryptToken(token, TEST_SECRET)
    expect(encrypted).not.toBe(token)
    expect(decryptToken(encrypted, TEST_SECRET)).toBe(token)
  })
})

describe('buildAuthUrl', () => {
  it('includes required scopes', () => {
    const url = new URL(buildAuthUrl('test-state', testConfig))
    const scope = url.searchParams.get('scope') ?? ''
    expect(scope).toContain('user-top-read')
    expect(scope).toContain('user-library-read')
  })

  it('encodes client_id, redirect_uri, and state into the URL', () => {
    const url = new URL(buildAuthUrl('my-state', testConfig))
    expect(url.searchParams.get('client_id')).toBe('test-client-id')
    expect(url.searchParams.get('redirect_uri')).toBe('http://localhost:3000/auth/callback')
    expect(url.searchParams.get('state')).toBe('my-state')
    expect(url.searchParams.get('response_type')).toBe('code')
  })
})
