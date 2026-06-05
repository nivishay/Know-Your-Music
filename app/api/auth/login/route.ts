import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getOAuthUrl } from "@/services/auth/spotify";

export async function GET() {
  const state = randomBytes(16).toString("hex");
  const response = NextResponse.redirect(getOAuthUrl(state));

  response.cookies.set("spotify_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return response;
}
