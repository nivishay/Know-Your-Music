import { NextRequest, NextResponse } from "next/server";
import { createSession, SessionError } from "@/services/quiz/createSession";
import { getValidAccessToken } from "@/lib/auth/getValidAccessToken";
import type { GeneralFlavor } from "@/types";

const VALID_FLAVORS: GeneralFlavor[] = ["charts"];

export async function POST(req: NextRequest) {
  const token = await getValidAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { flavor } = await req.json();

  if (!VALID_FLAVORS.includes(flavor)) {
    return NextResponse.json({ error: "Invalid flavor" }, { status: 400 });
  }

  try {
    const { sessionId, clips } = await createSession({ flavor, format: "round", token });
    return NextResponse.json({ sessionId, clips });
  } catch (err) {
    if (err instanceof SessionError) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Could not build quiz session" }, { status: 500 });
  }
}
