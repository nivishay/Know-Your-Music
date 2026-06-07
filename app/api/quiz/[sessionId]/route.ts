import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createSupabaseAdminClient } from '@/lib/supabase/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { sessionId } = await params
  const body = await request.json() as { score: number; totalPossible: number }

  const db = createSupabaseAdminClient()
  const { error } = await db
    .from('quiz_sessions')
    .update({ score: body.score, total_possible: body.totalPossible })
    .eq('id', sessionId)

  if (error) throw error
  return NextResponse.json({ ok: true })
}
