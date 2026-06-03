import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScoreScreen } from "./ScoreScreen";
import type { ScoreResult } from "@/types";

describe("ScoreScreen", () => {
  it("shows the numeric score", () => {
    const result: ScoreResult = { score: 8, totalPossible: 10, label: "True Fan" };
    render(<ScoreScreen result={result} />);
    expect(screen.getByText(/8/)).toBeInTheDocument();
  });

  it("shows the score label", () => {
    const result: ScoreResult = { score: 10, totalPossible: 10, label: "Superfan" };
    render(<ScoreScreen result={result} />);
    expect(screen.getByText("Superfan")).toBeInTheDocument();
  });

  it("shows the correct label for each score boundary", () => {
    const cases: Array<[ScoreResult, string]> = [
      [{ score: 10, totalPossible: 10, label: "Superfan" }, "Superfan"],
      [{ score: 9, totalPossible: 10, label: "True Fan" }, "True Fan"],
      [{ score: 6, totalPossible: 10, label: "Casual Listener" }, "Casual Listener"],
      [{ score: 4, totalPossible: 10, label: "Just Passing Through" }, "Just Passing Through"],
      [{ score: 1, totalPossible: 10, label: "Who Are You?" }, "Who Are You?"],
    ];
    cases.forEach(([result, expectedLabel]) => {
      const { unmount } = render(<ScoreScreen result={result} />);
      expect(screen.getByText(expectedLabel)).toBeInTheDocument();
      unmount();
    });
  });

  it("shows the total possible score", () => {
    const result: ScoreResult = { score: 7, totalPossible: 10, label: "Casual Listener" };
    render(<ScoreScreen result={result} />);
    expect(screen.getByText(/10/)).toBeInTheDocument();
  });
});
