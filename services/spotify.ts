import { getLikedTracks as _getLikedTracks } from '@/lib/spotify/tracks'
import { getArtistTracks as _getArtistTracks } from '@/lib/spotify/artist-tracks'
import type { SpotifyTrack } from '@/types'

export async function getLikedTracks(
  token: string,
  fetchFn: typeof globalThis.fetch = globalThis.fetch,
): Promise<SpotifyTrack[]> {
  return _getLikedTracks(token, fetchFn)
}

export async function getArtistTracks(
  artistName: string,
  token: string,
  fetchFn: typeof globalThis.fetch = globalThis.fetch,
): Promise<SpotifyTrack[]> {
  return _getArtistTracks(artistName, token, fetchFn)
}
