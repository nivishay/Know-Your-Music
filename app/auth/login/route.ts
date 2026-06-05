import { type NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { buildAuthUrl } from '@/lib/spotify/auth'
import { env } from '@/lib/env'

export async function GET(_request: NextRequest) {
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
