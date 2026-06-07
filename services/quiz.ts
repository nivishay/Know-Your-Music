import { getLikedTracks } from '@/services/spotify'
import { buildSongQuestion, buildArtistQuestion } from '@/lib/quiz/question'
import { createSupabaseAdminClient } from '@/lib/supabase/server'
import type { Clip } from '@/types'

export class NotEnoughTracksError extends Error {
  constructor() {
    super('Not enough playable tracks')
    this.name = 'NotEnoughTracksError'
  }
}

export async function buildPersonalSession(token: string, count = 5): Promise<string> {
  const allTracks = await getLikedTracks(token)
  const playable = allTracks.filter((t) => t.preview_url !== null)

  if (playable.length < count) {
    throw new NotEnoughTracksError()
  }

  const selected = [...playable].sort(() => Math.random() - 0.5).slice(0, count)

  const clips: Clip[] = selected.map((track) => ({
    trackId: track.id,
    previewUrl: track.preview_url!,
    songName: track.name,
    artistName: track.artists[0].name,
    albumName: track.album.name,
    albumYear: track.album.release_date.split('-')[0],
    albumImageUrl: track.album.images[0]?.url ?? null,
    songQuestion: buildSongQuestion(track, playable),
    artistQuestion: buildArtistQuestion(track, playable),
  }))

  const db = createSupabaseAdminClient()
  const { data, error } = await db
    .from('quiz_sessions')
    .insert({
      user_id: null,
      mode: 'personal',
      format: 'round',
      score: 0,
      total_possible: count * 2,
      clips: clips as unknown,
    })
    .select('id')
    .single()

  if (error) throw error
  return data.id
}
