import { getLikedTracks as _getLikedTracks } from '@/lib/spotify/tracks'
import type { SpotifyTrack } from '@/types'

export async function getLikedTracks(
  token: string,
  fetchFn: typeof globalThis.fetch = globalThis.fetch,
): Promise<SpotifyTrack[]> {
  return _getLikedTracks(token, fetchFn)
}

// TODO: implement when #08 (artist quiz) is built
export async function getArtistTracks(
  _artistId: string,
  _token: string,
): Promise<SpotifyTrack[]> {
  return []
}
