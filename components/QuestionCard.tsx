"use client";

import { useState } from "react";
import type { Clip, QuizAnswer } from "@/types";

interface QuestionCardProps {
  clip: Clip;
  clipIndex?: number;
  onComplete: (answer: QuizAnswer) => void;
}

export function QuestionCard({ clip, clipIndex = 0, onComplete }: QuestionCardProps) {
  const [songAnswer, setSongAnswer] = useState<string | null>(null);

  function handleSongAnswer(option: string) {
    setSongAnswer(option);
  }

  function handleArtistAnswer(artistAnswer: string) {
    onComplete({
      clipIndex,
      songAnswer,
      artistAnswer,
      songCorrect: songAnswer === clip.songQuestion.correct,
      artistCorrect: artistAnswer === clip.artistQuestion.correct,
    });
  }

  if (!songAnswer) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-center">Name That Song</h2>
        <div className="grid grid-cols-2 gap-3">
          {clip.songQuestion.options.map((option) => (
            <button
              key={option}
              onClick={() => handleSongAnswer(option)}
              className="p-4 rounded-xl border-2 border-gray-200 text-center font-medium hover:border-green-500"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold text-center">Name That Artist</h2>
      <div className="grid grid-cols-2 gap-3">
        {clip.artistQuestion.options.map((option) => (
          <button
            key={option}
            onClick={() => handleArtistAnswer(option)}
            className="p-4 rounded-xl border-2 border-gray-200 text-center font-medium hover:border-green-500"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
