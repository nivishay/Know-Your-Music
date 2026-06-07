import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { buildArtistSession, NotEnoughTracksError } from '@/services/quiz'

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { artistName } = await request.json()

  try {
    const sessionId = await buildArtistSession(token, artistName)
    return NextResponse.json({ sessionId })
  } catch (err) {
    if (err instanceof NotEnoughTracksError) {
      return NextResponse.json(
        { error: `Not enough playable tracks for ${artistName} — try another.` },
        { status: 422 },
      )
    }
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
