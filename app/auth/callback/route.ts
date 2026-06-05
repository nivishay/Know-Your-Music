import { type NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { exchangeCode, getSpotifyProfile, encryptToken } from '@/lib/spotify/auth'
import { createSupabaseAdminClient } from '@/lib/supabase/server'
import { env } from '@/lib/env'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  const cookieStore = await cookies()
  const storedState = cookieStore.get('oauth_state')?.value
  cookieStore.delete('oauth_state')

  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(new URL('/?error=auth_failed', request.nextUrl.origin))
  }

  const { accessToken, refreshToken } = await exchangeCode(code, {
    clientId: env.spotify.clientId,
    clientSecret: env.spotify.clientSecret,
    redirectUri: env.spotify.redirectUri,
  })

  const { id: spotifyId } = await getSpotifyProfile(accessToken)

  const encryptedRefreshToken = encryptToken(refreshToken, env.encryption.secret)

  const supabase = createSupabaseAdminClient()
  await supabase.from('users').upsert(
    { spotify_id: spotifyId, refresh_token: encryptedRefreshToken },
    { onConflict: 'spotify_id' },
  )

  cookieStore.set('access_token', accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60, // 1 hour
    path: '/',
  })

  return NextResponse.redirect(new URL('/home', request.nextUrl.origin))
}
