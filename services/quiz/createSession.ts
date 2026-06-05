import { randomUUID } from "crypto";
import { generateClips } from "@/services/quiz/generateClips";
import { generateDistractors } from "@/services/quiz/generateDistractors";
import { shuffle } from "@/lib/shuffle";
import { createAdminClient } from "@/lib/supabase/server";
import type { Clip, GeneralFlavor, QuizFormat } from "@/types";
import type { Json } from "@/types/database";

export class SessionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SessionError";
  }
}

export async function createSession(options: {
  flavor: GeneralFlavor;
  format: QuizFormat;
  token: string;
  userId?: string;
}): Promise<{ sessionId: string; clips: Clip[] }> {
  const { flavor, format, token, userId = null } = options;

  if (flavor !== "charts") {
    throw new SessionError(`Flavor "${flavor}" is not yet supported`);
  }
  const trackCandidates = await generateClips(token);

  const distractorResults = await Promise.allSettled(
    trackCandidates.map((track) =>
      generateDistractors(token, track.trackId, track.artistName, track.songTitle)
    )
  );

  const clips: Clip[] = trackCandidates
    .map((track, i) => {
      const result = distractorResults[i];
      if (result.status !== "fulfilled") return null;
      const { artistDistractors, songDistractors } = result.value;
      return {
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
    })
    .filter((clip): clip is Clip => clip !== null);

  if (clips.length === 0) {
    throw new SessionError("Could not build any quiz clips");
  }

  const sessionId = randomUUID();
  const supabase = createAdminClient();
  const { error } = await supabase.from("quiz_sessions").insert({
    id: sessionId,
    user_id: userId,
    mode: "general",
    format,
    score: null,
    total_possible: clips.length * 2,
    clips: clips as unknown as Json,
  });

  if (error) throw new SessionError(error.message);

  return { sessionId, clips };
}
