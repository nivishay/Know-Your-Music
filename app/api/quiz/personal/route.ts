import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { buildPersonalSession, NotEnoughTracksError } from '@/services/quiz'

export async function POST() {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const sessionId = await buildPersonalSession(token)
    return NextResponse.json({ sessionId })
  } catch (err) {
    if (err instanceof NotEnoughTracksError) {
      return NextResponse.json({ error: 'Not enough playable tracks' }, { status: 400 })
    }
    throw err
  }
}
