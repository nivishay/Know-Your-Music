import type { SpotifyTrack } from '@/types'

export function pickTrack(tracks: SpotifyTrack[]): SpotifyTrack | null {
  return tracks[0] ?? null
}
