import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getLikedTracks } from '@/lib/spotify/tracks'

export default async function HomePage() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')?.value
  if (!accessToken) redirect('/')

  const tracks = await getLikedTracks(accessToken)

  return (
    <main className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Liked Songs</h1>
        <Link
          href="/quiz/now"
          className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          Start Quiz
        </Link>
      </div>
      <ul className="space-y-1 mt-2">
        {tracks.map((track) => (
          <li key={track.id} className="text-sm">
            <span className="font-medium">{track.name}</span>
            {' — '}
            <span className="text-gray-500">{track.artists.map((a) => a.name).join(', ')}</span>
          </li>
        ))}
      </ul>
    </main>
  )
}
