import { shuffle } from "@/lib/shuffle";

const GLOBAL_TOP_50_PLAYLIST_ID = "37i9dQZEVXbMDoHDwVN2tF";
const CLIPS_PER_ROUND = 5;

export interface TrackCandidate {
  trackId: string;
  previewUrl: string;
  songTitle: string;
  artistId: string;
  artistName: string;
}

export async function generateClips(token: string): Promise<TrackCandidate[]> {
  const response = await fetch(
    `https://api.spotify.com/v1/playlists/${GLOBAL_TOP_50_PLAYLIST_ID}/tracks?limit=50`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!response.ok) return [];
  const data = await response.json();

  const tracks: TrackCandidate[] = data.items
    .map((item: { track: { id: string; name: string; preview_url: string | null; artists: Array<{ id: string; name: string }> } }) => {
      const t = item.track;
      if (!t?.preview_url) return null;
      return {
        trackId: t.id,
        previewUrl: t.preview_url,
        songTitle: t.name,
        artistId: t.artists[0].id,
        artistName: t.artists[0].name,
      };
    })
    .filter(Boolean) as TrackCandidate[];

  return shuffle(tracks).slice(0, CLIPS_PER_ROUND);
}
