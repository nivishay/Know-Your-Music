import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createDecipheriv, scryptSync } from "crypto";
import type { Database } from "@/types/database";

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

// Inlined to keep proxy self-contained per Next.js docs recommendation.
// Must match the algorithm/salt in lib/crypto.ts exactly.
const CRYPTO_ALGORITHM = "aes-256-gcm";
const CRYPTO_SALT = "know-your-music-v1";

function decryptToken(ciphertext: string, secret: string): string {
  const key = scryptSync(secret, CRYPTO_SALT, 32);
  const parts = ciphertext.split(".");
  if (parts.length !== 3) throw new Error("Invalid ciphertext");
  const [ivB64, tagB64, encB64] = parts;
  const iv = Buffer.from(ivB64, "base64url");
  const tag = Buffer.from(tagB64, "base64url");
  const encrypted = Buffer.from(encB64, "base64url");
  const decipher = createDecipheriv(CRYPTO_ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

async function refreshSpotifyToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<{ access_token: string; expires_in: number }> {
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });
  if (!res.ok) throw new Error(`Spotify refresh failed: ${res.status}`);
  return res.json() as Promise<{ access_token: string; expires_in: number }>;
}

export async function proxy(request: NextRequest) {
  if (request.cookies.get("spotify_access_token")?.value) {
    return NextResponse.next();
  }

  const userId = request.cookies.get("spotify_user_id")?.value;
  if (!userId) return NextResponse.next();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const encSecret = process.env.REFRESH_TOKEN_SECRET;
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!supabaseUrl || !serviceKey || !encSecret || !clientId || !clientSecret) {
    return NextResponse.next();
  }

  try {
    const supabase = createClient<Database>(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: user } = await supabase
      .from("users")
      .select("refresh_token")
      .eq("spotify_id", userId)
      .single();

    if (!user?.refresh_token) return NextResponse.next();

    const refreshToken = decryptToken(user.refresh_token, encSecret);
    const { access_token, expires_in } = await refreshSpotifyToken(refreshToken, clientId, clientSecret);

    const response = NextResponse.next();
    response.cookies.set("spotify_access_token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: expires_in,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.next();
  }
}
