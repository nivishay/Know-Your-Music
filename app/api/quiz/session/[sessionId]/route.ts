import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import type { QuizAnswer } from "@/types";
import type { Json } from "@/types/database";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const body = await req.json();
  const answers: QuizAnswer[] = body.answers;

  if (!Array.isArray(answers)) {
    return NextResponse.json({ error: "answers must be an array" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("quiz_sessions")
    .update({ answers: answers as unknown as Json })
    .eq("id", sessionId);

  if (error) {
    return NextResponse.json({ error: "Failed to save answers" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
