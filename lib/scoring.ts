import type { QuizAnswer, ScoreLabel, ScoreResult } from "@/types";

export function getScoreLabel(score: number, totalPossible: number): ScoreLabel {
  if (score === totalPossible) return "Superfan";
  const ratio = totalPossible > 0 ? score / totalPossible : 0;
  if (ratio >= 0.8) return "True Fan";
  if (ratio >= 0.5) return "Casual Listener";
  if (ratio >= 0.3) return "Just Passing Through";
  return "Who Are You?";
}

export function calculateScore(answers: QuizAnswer[]): ScoreResult {
  const score = answers.reduce(
    (total, answer) =>
      total + (answer.songCorrect ? 1 : 0) + (answer.artistCorrect ? 1 : 0),
    0
  );
  const totalPossible = answers.length * 2;
  return { score, totalPossible, label: getScoreLabel(score, totalPossible) };
}
