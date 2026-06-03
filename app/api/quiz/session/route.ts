import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSpotifyAppToken } from "@/services/spotify/appToken";
import { generateClips } from "@/services/quiz/generateClips";
import { generateDistractors } from "@/services/quiz/generateDistractors";
import { createAdminClient } from "@/lib/supabase/server";
import type { Clip } from "@/types";
import type { Json } from "@/types/database";

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { mode } = body;

  if (mode !== "charts") {
    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  }

  const token = await getSpotifyAppToken();
  const trackCandidates = await generateClips(token);

  const distractorResults = await Promise.allSettled(
    trackCandidates.map((track) =>
      generateDistractors(token, track.trackId, track.artistName, track.songTitle)
    )
  );

  const clips: Clip[] = trackCandidates
    .map((track, i) => {
      const result = distractorResults[i];
      if (result.status !== "fulfilled" || result.value === null) return null;
      const distractors = result.value;
      return {
        trackId: track.trackId,
        previewUrl: track.previewUrl,
        songQuestion: { correct: track.songTitle, options: shuffle([track.songTitle, ...distractors.songDistractors]) },
        artistQuestion: { correct: track.artistName, options: shuffle([track.artistName, ...distractors.artistDistractors]) },
      };
    })
    .filter((clip): clip is Clip => clip !== null);

  if (clips.length === 0) {
    return NextResponse.json({ error: "Could not build quiz clips" }, { status: 500 });
  }

  const sessionId = randomUUID();
  const supabase = createAdminClient();
  const { error } = await supabase.from("quiz_sessions").insert({
    id: sessionId,
    user_id: null,
    mode: "general",
    format: "round",
    score: null,
    total_possible: clips.length * 2,
    clips: clips as unknown as Json,
  });

  if (error) {
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }

  return NextResponse.json({ sessionId, clips });
}
