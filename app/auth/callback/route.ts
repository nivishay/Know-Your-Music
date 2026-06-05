import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeCodeForTokens, getSpotifyUserId } from "@/services/auth/spotify";
import { encrypt } from "@/lib/crypto";
import { createAdminClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const cookieStore = await cookies();
  const storedState = cookieStore.get("spotify_oauth_state")?.value;

  const redirectError = NextResponse.redirect(new URL("/?auth=error", env.app.url));
  redirectError.cookies.delete("spotify_oauth_state");

  if (error || !code || !storedState || storedState !== state) {
    console.error("[auth/callback] guard failed:", { error, hasCode: !!code, hasStoredState: !!storedState, stateMatch: storedState === state });
    return redirectError;
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    console.log("[auth/callback] tokens exchanged ok");
    const spotifyId = await getSpotifyUserId(tokens.access_token);
    console.log("[auth/callback] got spotify user:", spotifyId);
    const encryptedRefreshToken = encrypt(tokens.refresh_token, env.encryption.secret);

    const supabase = createAdminClient();
    const { error: dbError } = await supabase
      .from("users")
      .upsert(
        { spotify_id: spotifyId, refresh_token: encryptedRefreshToken },
        { onConflict: "spotify_id" }
      );

    if (dbError) throw new Error(`DB upsert failed: ${dbError.message}`);

    const isProduction = process.env.NODE_ENV === "production";
    const accessTokenExpiry = new Date(Date.now() + tokens.expires_in * 1000);

    const response = NextResponse.redirect(new URL("/", env.app.url));
    response.cookies.delete("spotify_oauth_state");
    response.cookies.set("spotify_access_token", tokens.access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      expires: accessTokenExpiry,
      path: "/",
    });
    response.cookies.set("spotify_user_id", spotifyId, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    console.log("[auth/callback] success, redirecting home");
    return response;
  } catch (e) {
    console.error("[auth/callback] error:", e);
    return NextResponse.redirect(new URL("/?auth=error", env.app.url));
  }
}
