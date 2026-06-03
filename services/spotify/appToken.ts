import { env } from "@/lib/env";

// Token expiry buffer: refresh 60s before actual expiry
const EXPIRY_BUFFER_MS = 60_000;

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

export async function getSpotifyAppToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const credentials = Buffer.from(
    `${env.spotify.clientId}:${env.spotify.clientSecret}`
  ).toString("base64");

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }).toString(),
  });

  const data = await response.json();
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + data.expires_in * 1000 - EXPIRY_BUFFER_MS;

  return cachedToken!;
}
