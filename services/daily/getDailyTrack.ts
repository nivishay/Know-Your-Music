import type { TrackCandidate } from "@/services/quiz/generateClips";

function getDayOfYear(): number {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
}

export async function getDailyTrack(token: string): Promise<TrackCandidate> {
  const response = await fetch(
    "https://api.spotify.com/v1/search?q=year:2024&type=track&limit=50&market=US",
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!response.ok) throw new Error(`Spotify search failed: ${response.status}`);
  const data = await response.json() as {
    tracks: {
      items: Array<{
        id: string;
        name: string;
        preview_url: string | null;
        artists: Array<{ id: string; name: string }>;
      }>;
    };
  };

  const tracks: TrackCandidate[] = data.tracks.items
    .filter((t) => t.preview_url)
    .map((t) => ({
      trackId: t.id,
      previewUrl: t.preview_url!,
      songTitle: t.name,
      artistId: t.artists[0].id,
      artistName: t.artists[0].name,
    }));

  if (tracks.length === 0) throw new Error("No tracks with previews found");
  return tracks[getDayOfYear() % tracks.length];
}
