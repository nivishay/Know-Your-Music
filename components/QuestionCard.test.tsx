import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QuestionCard } from "./QuestionCard";
import type { Clip } from "@/types";

const MOCK_CLIP: Clip = {
  trackId: "track-1",
  previewUrl: "https://preview.example.com/clip.mp3",
  songQuestion: {
    correct: "Real Song Title",
    options: ["Real Song Title", "Wrong Song A", "Wrong Song B", "Wrong Song C"],
  },
  artistQuestion: {
    correct: "Real Artist",
    options: ["Real Artist", "Wrong Artist A", "Wrong Artist B", "Wrong Artist C"],
  },
};

describe("QuestionCard", () => {
  it("shows the song question (Q1) first", () => {
    render(<QuestionCard clip={MOCK_CLIP} onComplete={vi.fn()} />);
    expect(screen.getByText(/name that song/i)).toBeInTheDocument();
  });

  it("does not show the artist question (Q2) before Q1 is answered", () => {
    render(<QuestionCard clip={MOCK_CLIP} onComplete={vi.fn()} />);
    expect(screen.queryByText(/name that artist/i)).not.toBeInTheDocument();
  });

  it("shows the artist question after Q1 is answered", () => {
    render(<QuestionCard clip={MOCK_CLIP} onComplete={vi.fn()} />);

    fireEvent.click(screen.getByText("Real Song Title"));

    expect(screen.getByText(/name that artist/i)).toBeInTheDocument();
  });

  it("calls onComplete with both answers after Q2 is answered", () => {
    const onComplete = vi.fn();
    render(<QuestionCard clip={MOCK_CLIP} onComplete={onComplete} />);

    fireEvent.click(screen.getByText("Real Song Title"));
    fireEvent.click(screen.getByText("Real Artist"));

    expect(onComplete).toHaveBeenCalledWith({
      clipIndex: 0,
      songAnswer: "Real Song Title",
      artistAnswer: "Real Artist",
      songCorrect: true,
      artistCorrect: true,
    });
  });

  it("marks answers as incorrect when wrong option is chosen", () => {
    const onComplete = vi.fn();
    render(<QuestionCard clip={MOCK_CLIP} onComplete={onComplete} />);

    fireEvent.click(screen.getByText("Wrong Song A"));
    fireEvent.click(screen.getByText("Wrong Artist A"));

    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({ songCorrect: false, artistCorrect: false })
    );
  });
});
