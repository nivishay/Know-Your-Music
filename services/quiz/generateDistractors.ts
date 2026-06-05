const DISTRACTOR_COUNT = 3;

export class DistractorError extends Error {
  constructor(seedTrackId: string) {
    super(`Could not generate distractors for track ${seedTrackId}`);
    this.name = "DistractorError";
  }
}

export interface Distractors {
  artistDistractors: string[];
  songDistractors: string[];
}

export async function generateDistractors(
  token: string,
  seedTrackId: string,
  correctArtistName: string,
  correctSongTitle?: string
): Promise<Distractors> {
  const response = await fetch(
    "https://api.spotify.com/v1/search?q=year:2024&type=track&limit=50&market=US",
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!response.ok) throw new DistractorError(seedTrackId);

  const data = await response.json() as {
    tracks: {
      items: Array<{
        id: string;
        name: string;
        artists: Array<{ name: string }>;
      }>;
    };
  };

  const seenArtists = new Set([correctArtistName]);
  const seenSongs = new Set(correctSongTitle ? [correctSongTitle] : []);
  const artistDistractors: string[] = [];
  const songDistractors: string[] = [];

  for (const track of data.tracks.items) {
    if (track.id === seedTrackId) continue;
    const artistName = track.artists[0]?.name;
    if (artistName && !seenArtists.has(artistName) && artistDistractors.length < DISTRACTOR_COUNT) {
      seenArtists.add(artistName);
      artistDistractors.push(artistName);
    }
    if (track.name && !seenSongs.has(track.name) && songDistractors.length < DISTRACTOR_COUNT) {
      seenSongs.add(track.name);
      songDistractors.push(track.name);
    }
    if (artistDistractors.length >= DISTRACTOR_COUNT && songDistractors.length >= DISTRACTOR_COUNT) break;
  }

  if (artistDistractors.length < DISTRACTOR_COUNT || songDistractors.length < DISTRACTOR_COUNT) {
    throw new DistractorError(seedTrackId);
  }

  return { artistDistractors, songDistractors };
}
