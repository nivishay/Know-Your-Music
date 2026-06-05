"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AudioPlayer } from "@/components/AudioPlayer";
import { QuestionCard } from "@/components/QuestionCard";
import type { Clip, QuizAnswer } from "@/types";

interface QuizClientProps {
  sessionId: string;
  clips: Clip[];
}

export function QuizClient({ sessionId, clips }: QuizClientProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);

  const currentClip = clips[currentIndex];

  async function handleClipComplete(answer: QuizAnswer) {
    const updated = [...answers, { ...answer, clipIndex: currentIndex }];
    setAnswers(updated);

    if (currentIndex + 1 < clips.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Save answers to the session before navigating; silent failure matches
      // the spec's "progress lost silently on exit" behaviour.
      await fetch(`/api/quiz/session/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: updated }),
      }).catch(() => {});
      router.push(`/results/${sessionId}`);
    }
  }

  if (!currentClip) return null;

  return (
    <main className="max-w-lg mx-auto p-6 flex flex-col gap-6">
      <div className="text-sm text-gray-400 text-center">
        {currentIndex + 1} / {clips.length}
      </div>
      <AudioPlayer previewUrl={currentClip.previewUrl} />
      <QuestionCard
        clip={currentClip}
        clipIndex={currentIndex}
        onComplete={handleClipComplete}
      />
    </main>
  );
}
