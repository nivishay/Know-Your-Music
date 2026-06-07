import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getLikedTracks } from "@/lib/spotify/tracks";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const steps: Record<string, unknown> = {};

  // Step 1: auth
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value ?? null;
  steps.auth = token ? "ok" : "no token — not logged in";
  if (!token) return NextResponse.json({ steps }, { status: 401 });

  // Step 2: fetch liked tracks
  try {
    const tracks = await getLikedTracks(token);
    const withPreview = tracks.filter((t) => t.preview_url != null);
    steps.getLikedTracks = { ok: true, total: tracks.length, withPreview: withPreview.length };
  } catch (e) {
    steps.getLikedTracks = { ok: false, error: String(e) };
    return NextResponse.json({ steps });
  }

  // Step 3: DB connectivity
  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("quiz_sessions").select("id").limit(1);
    steps.supabase = error ? { ok: false, error: error.message } : { ok: true };
  } catch (e) {
    steps.supabase = { ok: false, error: String(e) };
  }

  return NextResponse.json({ steps });
}
