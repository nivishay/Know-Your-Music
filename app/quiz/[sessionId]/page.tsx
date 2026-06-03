import { createAdminClient } from "@/lib/supabase/server";
import { QuizClient } from "./QuizClient";
import type { Clip } from "@/types";

export default async function QuizSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  const supabase = createAdminClient();
  const { data: session } = await supabase
    .from("quiz_sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (!session) {
    return (
      <main className="p-8 text-center">
        <p className="text-gray-500">Session not found.</p>
      </main>
    );
  }

  const clips: Clip[] = (session.clips as unknown as Clip[]) ?? [];

  return <QuizClient sessionId={sessionId} clips={clips} />;
}
