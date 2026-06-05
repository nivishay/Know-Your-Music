import { ScoreScreen } from "@/components/ScoreScreen";
import { calculateScore } from "@/lib/scoring";
import { createAdminClient } from "@/lib/supabase/server";
import type { QuizAnswer } from "@/types";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  const supabase = createAdminClient();
  const { data: session } = await supabase
    .from("quiz_sessions")
    .select("answers")
    .eq("id", sessionId)
    .single();

  if (!session?.answers) {
    return (
      <main className="p-8 text-center">
        <p className="text-gray-500">No results found for session {sessionId}.</p>
      </main>
    );
  }

  const answers = session.answers as unknown as QuizAnswer[];
  const result = calculateScore(answers);

  return (
    <main className="max-w-lg mx-auto p-8">
      <ScoreScreen result={result} />
    </main>
  );
}
