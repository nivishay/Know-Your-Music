import type { SpotifyTrack } from '@/types'

interface SearchResponse {
  tracks?: { items: SpotifyTrack[] }
}

export async function getArtistTracks(
  artistName: string,
  token: string,
  fetchFn: typeof globalThis.fetch = globalThis.fetch,
): Promise<SpotifyTrack[]> {
  const params = new URLSearchParams({ q: `artist:${artistName}`, type: 'track', limit: '10' })
  const res = await fetchFn(`https://api.spotify.com/v1/search?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Spotify artist search failed: ${res.status} — ${body}`)
  }
  const data = (await res.json()) as SearchResponse
  const items = data.tracks?.items ?? []
  const lower = artistName.toLowerCase()
  return items.filter((t) => t.artists[0]?.name.toLowerCase() === lower)
}
