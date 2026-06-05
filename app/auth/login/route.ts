import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { randomBytes } from 'crypto'
import { buildAuthUrl } from '@/lib/spotify/auth'
import { env } from '@/lib/env'

export async function GET() {
  const state = randomBytes(16).toString('hex')
  const cookieStore = await cookies()
  cookieStore.set('oauth_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  })

  const url = buildAuthUrl(state, {
    clientId: env.spotify.clientId,
    redirectUri: env.spotify.redirectUri,
  })

  redirect(url)
}
