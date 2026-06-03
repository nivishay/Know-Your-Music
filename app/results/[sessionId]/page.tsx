import { ScoreScreen } from "@/components/ScoreScreen";
import { calculateScore } from "@/lib/scoring";
import type { QuizAnswer } from "@/types";

export default async function ResultsPage({
  params,
  searchParams,
}: {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ answers?: string }>;
}) {
  const { sessionId } = await params;
  const { answers: answersJson } = await searchParams;

  if (!answersJson) {
    return (
      <main className="p-8 text-center">
        <p className="text-gray-500">No results found for session {sessionId}.</p>
      </main>
    );
  }

  let answers: QuizAnswer[];
  try {
    answers = JSON.parse(answersJson);
  } catch {
    return (
      <main className="p-8 text-center">
        <p className="text-gray-500">Could not load results. Please try your quiz again.</p>
      </main>
    );
  }

  const result = calculateScore(answers);

  return (
    <main className="max-w-lg mx-auto p-8">
      <ScoreScreen result={result} />
    </main>
  );
}
