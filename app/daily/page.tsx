import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";
import { createDailySession } from "@/services/daily/createDailySession";
import { getValidAccessToken } from "@/lib/auth/getValidAccessToken";
import { ShareButton } from "@/components/ShareButton";

function getTodayISODate(): string {
  return new Date().toISOString().split("T")[0];
}

export default async function DailyPage() {
  const token = await getValidAccessToken();

  if (!token) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Login required</h1>
        <p className="text-gray-500 mb-6">Connect Spotify to play the Daily Challenge.</p>
        <a
          href="/api/auth/login"
          className="inline-block bg-green-500 text-white font-semibold px-6 py-3 rounded-full text-sm hover:bg-green-600"
        >
          Connect Spotify
        </a>
      </main>
    );
  }

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
      return (
        <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
          <h1 className="text-2xl font-bold mb-2">You&apos;re all done!</h1>
          <p className="text-gray-500 mb-6">Come back tomorrow for a new Daily Challenge.</p>
          <ShareButton />
        </main>
      );
    }
  }

  let sessionId: string | null = null;
  try {
    const result = await createDailySession(token);
    sessionId = result.sessionId;
  } catch (e) {
    console.error("[DailyPage] createDailySession failed:", e);
  }

  if (!sessionId) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Daily Challenge unavailable</h1>
        <p className="text-gray-500">Please try again later.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 max-w-lg mx-auto">
      <p className="text-xs font-semibold uppercase tracking-widest text-green-600 mb-1">
        Today&apos;s Challenge
      </p>
      <h1 className="text-2xl font-bold mb-2">Daily Challenge</h1>
      <p className="text-gray-500 mb-8">One song, same for everyone. Come back tomorrow for a new one.</p>
      <div className="flex gap-3">
        <a
          href={`/quiz/${sessionId}`}
          className="inline-block bg-green-500 text-white font-semibold px-8 py-3 rounded-full hover:bg-green-600 active:scale-95 transition-all"
        >
          Play
        </a>
        <ShareButton />
      </div>
    </main>
  );
}
