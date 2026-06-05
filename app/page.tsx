import { HomePageClient } from "./HomePageClient";

export default async function HomePage() {
  let isAuthenticated = false;
  let dailySessionId: string | null = null;

  try {
    const { getValidAccessToken } = await import("@/lib/auth/getValidAccessToken");
    const token = await getValidAccessToken();
    isAuthenticated = token !== null;

    if (token) {
      const { createDailySession } = await import("@/services/daily/createDailySession");
      const { sessionId } = await createDailySession(token);
      dailySessionId = sessionId;
    }
  } catch (e) {
    console.error("[HomePage] session generation failed:", e);
  }

  return <HomePageClient isAuthenticated={isAuthenticated} dailySessionId={dailySessionId} />;
}
