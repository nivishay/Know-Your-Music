import type { SpotifyTrack } from '@/types'

interface TracksPage {
  items: Array<{ track: SpotifyTrack }>
  next: string | null
}

export async function getLikedTracks(
  accessToken: string,
  fetchFn: typeof globalThis.fetch = globalThis.fetch,
): Promise<SpotifyTrack[]> {
  const tracks: SpotifyTrack[] = []
  let url: string | null = 'https://api.spotify.com/v1/me/tracks?limit=50&market=from_token'

  while (url && tracks.length < 100) {
    const res = await fetchFn(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) throw new Error(`Failed to fetch liked tracks: ${res.status}`)
    const page = await res.json() as TracksPage
    for (const item of page.items) {
      tracks.push(item.track)
    }
    url = page.next
  }

  return tracks.slice(0, 100)
}
