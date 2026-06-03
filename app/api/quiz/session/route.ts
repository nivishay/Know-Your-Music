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

  const clips: Clip[] = [];
  for (const track of trackCandidates) {
    const distractors = await generateDistractors(token, track.trackId, track.artistName);
    if (!distractors) continue;

    const songOptions = shuffle([track.songTitle, ...distractors.songDistractors]);
    const artistOptions = shuffle([track.artistName, ...distractors.artistDistractors]);

    clips.push({
      trackId: track.trackId,
      previewUrl: track.previewUrl,
      songQuestion: { correct: track.songTitle, options: songOptions },
      artistQuestion: { correct: track.artistName, options: artistOptions },
    });
  }

  const sessionId = randomUUID();
  const supabase = createAdminClient();
  await supabase.from("quiz_sessions").insert({
    id: sessionId,
    user_id: null,
    mode: "general",
    format: "round",
    score: null,
    total_possible: clips.length * 2,
    clips: clips as unknown as Json,
  });

  return NextResponse.json({ sessionId, clips });
}
