import type { ScoreResult } from "@/types";

interface ScoreScreenProps {
  result: ScoreResult;
}

export function ScoreScreen({ result }: ScoreScreenProps) {
  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <p className="text-6xl font-bold">
        {result.score}
        <span className="text-2xl text-gray-400">/{result.totalPossible}</span>
      </p>
      <p className="text-3xl font-semibold">{result.label}</p>
    </div>
  );
}
