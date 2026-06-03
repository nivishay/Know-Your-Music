// @vitest-environment node
import { describe, it, expect } from "vitest";
import { calculateScore, getScoreLabel } from "./scoring";
import type { QuizAnswer } from "@/types";

function makeAnswer(songCorrect: boolean, artistCorrect: boolean, index = 0): QuizAnswer {
  return {
    clipIndex: index,
    songAnswer: songCorrect ? "correct" : "wrong",
    artistAnswer: artistCorrect ? "correct" : "wrong",
    songCorrect,
    artistCorrect,
  };
}

describe("calculateScore", () => {
  it("counts 1 point per correct answer", () => {
    const answers = [
      makeAnswer(true, false, 0),
      makeAnswer(false, true, 1),
    ];
    expect(calculateScore(answers).score).toBe(2);
  });

  it("returns 0 when all answers are wrong", () => {
    const answers = Array.from({ length: 5 }, (_, i) => makeAnswer(false, false, i));
    expect(calculateScore(answers).score).toBe(0);
  });

  it("returns 10 when all 5 clips answered correctly", () => {
    const answers = Array.from({ length: 5 }, (_, i) => makeAnswer(true, true, i));
    const result = calculateScore(answers);
    expect(result.score).toBe(10);
    expect(result.totalPossible).toBe(10);
  });

  it("includes the score label in the result", () => {
    const answers = Array.from({ length: 5 }, (_, i) => makeAnswer(true, true, i));
    expect(calculateScore(answers).label).toBe("Superfan");
  });
});

describe("getScoreLabel", () => {
  it("returns Superfan for score 10", () => {
    expect(getScoreLabel(10)).toBe("Superfan");
  });

  it("returns True Fan for scores 8 and 9", () => {
    expect(getScoreLabel(8)).toBe("True Fan");
    expect(getScoreLabel(9)).toBe("True Fan");
  });

  it("returns Casual Listener for scores 5, 6, 7", () => {
    expect(getScoreLabel(5)).toBe("Casual Listener");
    expect(getScoreLabel(6)).toBe("Casual Listener");
    expect(getScoreLabel(7)).toBe("Casual Listener");
  });

  it("returns Just Passing Through for scores 3 and 4", () => {
    expect(getScoreLabel(3)).toBe("Just Passing Through");
    expect(getScoreLabel(4)).toBe("Just Passing Through");
  });

  it("returns Who Are You? for scores 0, 1, 2", () => {
    expect(getScoreLabel(0)).toBe("Who Are You?");
    expect(getScoreLabel(1)).toBe("Who Are You?");
    expect(getScoreLabel(2)).toBe("Who Are You?");
  });
});
