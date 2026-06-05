import { cookies } from "next/headers";
import { decrypt } from "@/lib/crypto";
import { refreshAccessToken } from "@/services/auth/spotify";
import { createAdminClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

/**
 * Returns a valid Spotify access token for the current user, refreshing silently if expired.
 * Returns null if the user is not logged in or if the refresh token is invalid.
 * Only valid in Next.js server contexts (Route Handlers, Server Components).
 */
export async function getValidAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("spotify_access_token")?.value;

  if (accessToken) return accessToken;

  // Cookie absent = token expired or not logged in. Check for user ID to distinguish.
  const userId = cookieStore.get("spotify_user_id")?.value;
  if (!userId) return null;

  try {
    const supabase = createAdminClient();
    const { data: user } = await supabase
      .from("users")
      .select("refresh_token")
      .eq("spotify_id", userId)
      .single();

    if (!user?.refresh_token) return null;

    const decryptedRefreshToken = decrypt(user.refresh_token, env.encryption.secret);
    const { access_token, expires_in } = await refreshAccessToken(decryptedRefreshToken);

    const isProduction = process.env.NODE_ENV === "production";
    try {
      cookieStore.set("spotify_access_token", access_token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        expires: new Date(Date.now() + expires_in * 1000),
        path: "/",
      });
    } catch {
      // Server Components are read-only; token still returned for this request
    }

    return access_token;
  } catch {
    return null;
  }
}
