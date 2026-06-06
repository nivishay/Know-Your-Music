import { type NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { buildAuthUrl } from '@/lib/spotify/auth'
import { env } from '@/lib/env'

export async function GET(request: NextRequest) {
  // Spotify only allows 127.0.0.1 (not localhost) as a redirect URI.
  // The oauth_state cookie must be set on the same host Spotify redirects back to,
  // so if the browser hit us on localhost, redirect them to 127.0.0.1 first.
  // Use the Host header — request.nextUrl is normalized to localhost internally by Next.js.
  const host = request.headers.get('host') ?? ''
  if (host.startsWith('localhost')) {
    const corrected = new URL(request.url)
    corrected.hostname = '127.0.0.1'
    return NextResponse.redirect(corrected)
  }

  const state = randomBytes(16).toString('hex')
  const url = buildAuthUrl(state, {
    clientId: env.spotify.clientId,
    redirectUri: env.spotify.redirectUri,
  })

  const response = NextResponse.redirect(url)
  response.cookies.set('oauth_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 10,
    path: '/',
  })
  return response
}
