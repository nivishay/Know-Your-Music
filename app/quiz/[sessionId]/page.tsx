import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { createSupabaseAdminClient } from '@/lib/supabase/server'
import { QuizClient } from '@/components/QuizClient'
import type { QuizSession, Clip } from '@/types'

export default async function QuizSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')?.value
  if (!accessToken) redirect('/')

  const { sessionId } = await params
  const db = createSupabaseAdminClient()
  const { data: row } = await db
    .from('quiz_sessions')
    .select('id, user_id, mode, format, clips, created_at')
    .eq('id', sessionId)
    .single()

  if (!row || !row.clips) notFound()

  const session: QuizSession = {
    id: row.id,
    userId: row.user_id,
    mode: row.mode as QuizSession['mode'],
    format: row.format as QuizSession['format'],
    clips: row.clips as unknown as Clip[],
    createdAt: row.created_at,
  }

  return <QuizClient session={session} accessToken={accessToken} />
}
