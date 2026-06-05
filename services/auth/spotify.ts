import { env } from "@/lib/env";

const ACCOUNTS_BASE = "https://accounts.spotify.com";

function basicAuth(): string {
  return Buffer.from(`${env.spotify.clientId}:${env.spotify.clientSecret}`).toString("base64");
}

export function getOAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: env.spotify.clientId,
    response_type: "code",
    redirect_uri: env.spotify.redirectUri,
    scope: "user-top-read user-library-read",
    state,
  });
  return `${ACCOUNTS_BASE}/authorize?${params}`;
}

interface SpotifyTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export async function exchangeCodeForTokens(code: string): Promise<SpotifyTokens> {
  const res = await fetch(`${ACCOUNTS_BASE}/api/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: env.spotify.redirectUri,
    }),
  });
  if (!res.ok) throw new Error(`Spotify token exchange failed: ${res.status}`);
  return res.json() as Promise<SpotifyTokens>;
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<{ access_token: string; expires_in: number }> {
  const res = await fetch(`${ACCOUNTS_BASE}/api/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });
  if (!res.ok) throw new Error(`Spotify token refresh failed: ${res.status}`);
  return res.json() as Promise<{ access_token: string; expires_in: number }>;
}

export async function getSpotifyUserId(accessToken: string): Promise<string> {
  const res = await fetch("https://api.spotify.com/v1/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Spotify user profile fetch failed: ${res.status}`);
  const data = (await res.json()) as { id: string };
  return data.id;
}
