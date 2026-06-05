import { randomUUID } from "crypto";
import { getDailyTrack } from "@/services/daily/getDailyTrack";
import { generateDistractors } from "@/services/quiz/generateDistractors";
import { shuffle } from "@/lib/shuffle";
import { createAdminClient } from "@/lib/supabase/server";
import type { Clip } from "@/types";
import type { Json } from "@/types/database";

export class DailySessionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DailySessionError";
  }
}

export async function createDailySession(token: string): Promise<{ sessionId: string; clips: Clip[] }> {
  const track = await getDailyTrack(token);

  const { artistDistractors, songDistractors } = await generateDistractors(
    token,
    track.trackId,
    track.artistName,
    track.songTitle
  );

  const clip: Clip = {
    trackId: track.trackId,
    previewUrl: track.previewUrl,
    songQuestion: {
      correct: track.songTitle,
      options: shuffle([track.songTitle, ...songDistractors]),
    },
    artistQuestion: {
      correct: track.artistName,
      options: shuffle([track.artistName, ...artistDistractors]),
    },
  };

  const sessionId = randomUUID();
  const supabase = createAdminClient();
  const { error } = await supabase.from("quiz_sessions").insert({
    id: sessionId,
    user_id: null,
    mode: "general",
    format: "round",
    score: null,
    total_possible: 2,
    clips: [clip] as unknown as Json,
  });

  if (error) throw new DailySessionError(error.message);

  return { sessionId, clips: [clip] };
}
