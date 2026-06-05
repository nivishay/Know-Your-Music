import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";
import { createDailySession } from "@/services/daily/createDailySession";
import { getValidAccessToken } from "@/lib/auth/getValidAccessToken";

function getTodayISODate(): string {
  return new Date().toISOString().split("T")[0];
}

export async function GET(_req: NextRequest) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("spotify_user_id")?.value;

  if (userId) {
    const supabase = createAdminClient();
    const { data: user } = await supabase
      .from("users")
      .select("last_daily_played")
      .eq("spotify_id", userId)
      .single();

    if (user?.last_daily_played === getTodayISODate()) {
      return NextResponse.json(
        { blocked: true, message: "You have already played today's challenge. Come back tomorrow!" },
        { status: 403 }
      );
    }
  }

  const token = await getValidAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const { sessionId, clips } = await createDailySession(token);
    return NextResponse.json({ sessionId, clips });
  } catch (e) {
    console.error("[api/daily] createDailySession failed:", e);
    return NextResponse.json({ error: "Could not build daily session" }, { status: 500 });
  }
}

export async function POST(_req: NextRequest) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("spotify_user_id")?.value;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("users")
    .update({ last_daily_played: getTodayISODate() })
    .eq("spotify_id", userId);

  if (error) {
    return NextResponse.json({ error: "Failed to mark daily played" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
