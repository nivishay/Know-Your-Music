import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto'

function deriveKey(secret: string): Buffer {
  return createHash('sha256').update(secret, 'utf8').digest()
}

export interface AuthConfig {
  clientId: string
  redirectUri: string
}

export function encryptToken(token: string, secret: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', deriveKey(secret), iv)
  const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, encrypted]).toString('base64')
}

export function decryptToken(encrypted: string, secret: string): string {
  const buf = Buffer.from(encrypted, 'base64')
  const iv = buf.subarray(0, 12)
  const tag = buf.subarray(12, 28)
  const data = buf.subarray(28)
  const decipher = createDecipheriv('aes-256-gcm', deriveKey(secret), iv)
  decipher.setAuthTag(tag)
  return decipher.update(data) + decipher.final('utf8')
}

export interface ExchangeConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  fetch?: typeof globalThis.fetch
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

const SCOPES = [
  'user-library-read',
  'user-read-private',
  'user-read-email',
  'streaming',
  'user-modify-playback-state',
]

export async function exchangeCode(
  code: string,
  config: ExchangeConfig,
): Promise<TokenPair> {
  const fetchFn = config.fetch ?? globalThis.fetch
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: config.redirectUri,
  })
  const credentials = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')
  const res = await fetchFn('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: body.toString(),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '(unreadable)')
    throw new Error(`Token exchange failed: ${res.status} — ${body}`)
  }
  const data = await res.json() as { access_token: string; refresh_token: string }
  return { accessToken: data.access_token, refreshToken: data.refresh_token }
}

export interface SpotifyProfile {
  id: string
}

export async function getSpotifyProfile(
  accessToken: string,
  fetchFn: typeof globalThis.fetch = globalThis.fetch,
): Promise<SpotifyProfile> {
  const res = await fetchFn('https://api.spotify.com/v1/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '(unreadable)')
    const retryAfter = res.headers.get('Retry-After')
    const xRateLimit = res.headers.get('X-RateLimit-Reset')
    console.error('[getSpotifyProfile] headers:', { retryAfter, xRateLimit })
    throw new Error(`Failed to fetch Spotify profile: ${res.status} — ${body}`)
  }
  return res.json() as Promise<SpotifyProfile>
}

export function buildAuthUrl(
  state: string,
  config: AuthConfig,
): string {
  const { clientId, redirectUri } = config
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: SCOPES.join(' '),
    redirect_uri: redirectUri,
    state,
  })
  return `https://accounts.spotify.com/authorize?${params}`
}
