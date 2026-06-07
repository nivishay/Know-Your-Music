import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getLikedTracks } from '@/lib/spotify/tracks'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  if (!token) return NextResponse.json({ error: 'not logged in' }, { status: 401 })

  // Test 1: liked tracks (full TrackObject via /me/tracks)
  const tracks = await getLikedTracks(token)
  const withPreview = tracks.filter((t) => t.preview_url != null)
  const firstTrack = tracks[0] ?? null

  // Test 2: fetch that same track individually via GET /tracks/{id}
  let singleTrack = null
  if (firstTrack) {
    const res = await fetch(`https://api.spotify.com/v1/tracks/${firstTrack.id}?market=from_token`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    singleTrack = await res.json()
  }

  return NextResponse.json({
    likedTracks: { total: tracks.length, withPreview: withPreview.length },
    firstTrackFromLibrary: { id: firstTrack?.id, preview_url: firstTrack?.preview_url },
    sameTrackFetchedDirectly: { id: singleTrack?.id, preview_url: singleTrack?.preview_url },
  })
}
