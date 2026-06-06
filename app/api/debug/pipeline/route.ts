import { NextResponse } from "next/server";
import { getValidAccessToken } from "@/lib/auth/getValidAccessToken";
import { getDailyTrack } from "@/services/daily/getDailyTrack";
import { generateDistractors } from "@/services/quiz/generateDistractors";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const steps: Record<string, unknown> = {};

  // Step 1: auth
  const token = await getValidAccessToken();
  steps.auth = token ? "ok" : "no token — not logged in";
  if (!token) return NextResponse.json({ steps }, { status: 401 });
  
  // Step 2: fetch daily track
  let track: Awaited<ReturnType<typeof getDailyTrack>> | null = null;
  try {
    track = await getDailyTrack(token);
    steps.getDailyTrack = { ok: true, song: track.songTitle, artist: track.artistName };
  } catch (e) {
    steps.getDailyTrack = { ok: false, error: String(e) };
    return NextResponse.json({ steps });
  }

  // Step 3: generate distractors
  try {
    const dist = await generateDistractors(token, track.trackId, track.artistName, track.songTitle);
    steps.generateDistractors = { ok: true, artistCount: dist.artistDistractors.length, songCount: dist.songDistractors.length };
  } catch (e) {
    steps.generateDistractors = { ok: false, error: String(e) };
    return NextResponse.json({ steps });
  }

  // Step 4: DB write test
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("quiz_sessions").select("id").limit(1);
    steps.supabase = error ? { ok: false, error: error.message } : { ok: true };
  } catch (e) {
    steps.supabase = { ok: false, error: String(e) };
  }

  return NextResponse.json({ steps });
}
