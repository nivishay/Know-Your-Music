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
      <h1 className="mb-4 text-2xl font-bold">Your Liked Songs</h1>
      <ul className="space-y-1">
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
