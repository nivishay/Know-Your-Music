import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getLikedTracks } from '@/lib/spotify/tracks'
import { pickTrack } from '@/lib/quiz/pool'
import { buildSongQuestion } from '@/lib/quiz/question'
import { SpotifyPlayer } from '@/components/SpotifyPlayer'
import { SongQuestion } from '@/components/SongQuestion'

export default async function QuizSessionPage() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')?.value
  if (!accessToken) redirect('/')

  const tracks = await getLikedTracks(accessToken)
  const track = pickTrack(tracks)

  if (!track) {
    return (
      <main className="p-8">
        <p className="text-red-500">No liked songs found.</p>
      </main>
    )
  }

  const question = buildSongQuestion(track, tracks)

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <SpotifyPlayer accessToken={accessToken} trackUri={`spotify:track:${track.id}`} />
      <SongQuestion question={question} />
    </main>
  )
}
