const MAX_RETRIES = 2;
const RECOMMENDATIONS_LIMIT = 20;

export interface Distractors {
  artistDistractors: string[];
  songDistractors: string[];
}

export async function generateDistractors(
  token: string,
  seedTrackId: string,
  correctArtistName: string
): Promise<Distractors | null> {
  const seenArtists = new Set<string>();
  const seenSongs = new Set<string>();
  let artistDistractors: string[] = [];
  let songDistractors: string[] = [];

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const response = await fetch(
      `https://api.spotify.com/v1/recommendations?seed_tracks=${seedTrackId}&limit=${RECOMMENDATIONS_LIMIT}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await response.json();
    const tracks: Array<{ name: string; artists: Array<{ name: string }> }> = data.tracks;

    for (const track of tracks) {
      const artistName = track.artists[0]?.name;
      if (artistName && artistName !== correctArtistName && !seenArtists.has(artistName)) {
        seenArtists.add(artistName);
        artistDistractors.push(artistName);
      }
      if (track.name && !seenSongs.has(track.name)) {
        seenSongs.add(track.name);
        songDistractors.push(track.name);
      }
    }

    if (artistDistractors.length >= 3) {
      return {
        artistDistractors: artistDistractors.slice(0, 3),
        songDistractors: songDistractors.slice(0, 3),
      };
    }
  }

  return null;
}
