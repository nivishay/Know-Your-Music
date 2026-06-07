import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getLikedTracks } from '@/lib/spotify/tracks'
import { QuizModeCard } from '@/components/QuizModeCard'
import { ArtistCard } from '@/components/ArtistCard'
import { ArtistSearch } from '@/components/ArtistSearch'

export default async function HomePage() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')?.value
  if (!accessToken) redirect('/')

  const tracks = await getLikedTracks(accessToken)

  // Build unique artist list using first album image found per artist
  const artistMap = new Map<string, { name: string; imageUrl: string | null }>()
  for (const track of tracks) {
    const artist = track.artists[0]
    if (!artistMap.has(artist.id)) {
      artistMap.set(artist.id, {
        name: artist.name,
        imageUrl: track.album.images[0]?.url ?? null,
      })
    }
  }
  const artists = Array.from(artistMap.values()).slice(0, 12)

  return (
    <main className="min-h-screen bg-[#0d0d0d] text-white px-5 pt-10 pb-8 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="white" width="24" height="24">
            <path d="M12 3a9 9 0 1 0 0 18A9 9 0 0 0 12 3zm0 16a7 7 0 1 1 0-14 7 7 0 0 1 0 14zm-1-4h2v2h-2zm0-8h2v6h-2z" />
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold leading-tight">Know Your Music</h1>
          <p className="text-sm text-gray-400">Test your music knowledge</p>
        </div>
      </div>

      {/* Quiz mode cards */}
      <div className="space-y-3 mb-10">
        <QuizModeCard
          icon={
            <svg viewBox="0 0 24 24" fill="#22c55e" width="22" height="22">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          }
          title="How well do you know your music?"
          subtitle="5 songs • 10 points max"
          apiPath="/api/quiz/personal"
        />
        <QuizModeCard
          icon={
            <svg viewBox="0 0 24 24" fill="#22c55e" width="22" height="22">
              <path d="M7 2v11h3v9l7-12h-4l4-8z" />
            </svg>
          }
          title="Try a Song"
          subtitle="Quick demo • 1 random song"
          apiPath="/api/quiz/demo"
        />
      </div>

      {/* Artist Quiz section */}
      <section>
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-bold">Artist Quiz</h2>
            <p className="text-sm text-gray-400">Pick an artist, test your knowledge</p>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" width="20" height="20" className="mt-1 flex-shrink-0">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </div>

        <ArtistSearch />

        {/* Artist cards */}
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-none">
          {artists.map((artist) => (
            <ArtistCard key={artist.name} artistName={artist.name} imageUrl={artist.imageUrl} />
          ))}
        </div>
      </section>
    </main>
  )
}
