import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getLikedTracks } from '@/lib/spotify/tracks'
import { pickPreviewTrack } from '@/lib/quiz/pool'
import { buildSongQuestion } from '@/lib/quiz/question'
import { AudioPlayer } from '@/components/AudioPlayer'
import { SongQuestion } from '@/components/SongQuestion'

export default async function QuizSessionPage() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')?.value
  if (!accessToken) redirect('/')

  const tracks = await getLikedTracks(accessToken)
  const track = pickPreviewTrack(tracks)

  if (!track) {
    return (
      <main className="p-8">
        <p className="text-red-500">None of your liked songs have a preview clip available.</p>
      </main>
    )
  }

  const question = buildSongQuestion(track, tracks)

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <AudioPlayer previewUrl={track.preview_url!} />
      <SongQuestion question={question} />
    </main>
  )
}
