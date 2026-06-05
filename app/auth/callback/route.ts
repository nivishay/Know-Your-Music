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

  if (!code || !state || state !== storedState) {
    console.error('[auth/callback] state_mismatch — code:', !!code, 'state:', !!state, 'stateMatch:', state === storedState, 'storedState:', !!storedState)
    const response = NextResponse.redirect(new URL('/?error=auth_failed', request.nextUrl.origin))
    response.cookies.delete('oauth_state')
    return response
  }

  try {
    const { accessToken, refreshToken } = await exchangeCode(code, {
      clientId: env.spotify.clientId,
      clientSecret: env.spotify.clientSecret,
      redirectUri: env.spotify.redirectUri,
    })

    const { id: spotifyId } = await getSpotifyProfile(accessToken)

    const encryptedRefreshToken = encryptToken(refreshToken, env.encryption.secret)

    const supabase = createSupabaseAdminClient()
    const { error: upsertError } = await supabase.from('users').upsert(
      { spotify_id: spotifyId, refresh_token: encryptedRefreshToken },
      { onConflict: 'spotify_id' },
    )
    if (upsertError) {
      console.error('[auth/callback] upsert failed:', upsertError)
      return NextResponse.redirect(new URL('/?error=db_error', request.nextUrl.origin))
    }

    const response = NextResponse.redirect(new URL('/home', request.nextUrl.origin))
    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60,
      path: '/',
    })
    response.cookies.delete('oauth_state')
    return response
  } catch (err) {
    console.error('[auth/callback] error:', err)
    return NextResponse.redirect(new URL('/?error=auth_failed', request.nextUrl.origin))
  }
}
