import type { SpotifyTrack } from '@/types'

export function pickPreviewTrack(tracks: SpotifyTrack[]): SpotifyTrack | null {
  return tracks.find((t) => t.preview_url !== null) ?? null
}
