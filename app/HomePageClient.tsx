"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ModeCard } from "@/components/ModeCard";
import type { GeneralFlavor } from "@/types";

interface HomePageClientProps {
  isAuthenticated: boolean;
  dailySessionId: string | null;
}

type Mode = "general" | "personal";

const FLAVOR_MODES: { title: string; description: string; flavor: GeneralFlavor }[] = [
  { title: "Charts", description: "Guess songs from the current top charts", flavor: "charts" },
  { title: "Genre", description: "Pick a genre and test your knowledge", flavor: "genre" },
  { title: "Artist", description: "Deep-dive into a single artist's discography", flavor: "artist" },
];

export function HomePageClient({ isAuthenticated, dailySessionId }: HomePageClientProps) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("personal");

  useEffect(() => {
    const saved = localStorage.getItem("kym_mode");
    if (saved === "general" || saved === "personal") setMode(saved);
  }, []);

  function switchMode(m: Mode) {
    setMode(m);
    localStorage.setItem("kym_mode", m);
  }

  async function startSession(flavor: GeneralFlavor) {
    const res = await fetch("/api/quiz/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flavor }),
    });
    if (!res.ok) return;
    const { sessionId } = await res.json();
    router.push(`/quiz/${sessionId}`);
  }

  return (
    <main className="min-h-screen p-6 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-2">Know Your Music</h1>

      {isAuthenticated && (
        <div role="tablist" className="flex gap-2 mb-6">
          <button
            role="tab"
            aria-selected={mode === "general"}
            onClick={() => switchMode("general")}
          >
            General
          </button>
          <button
            role="tab"
            aria-selected={mode === "personal"}
            onClick={() => switchMode("personal")}
          >
            Personal
          </button>
        </div>
      )}

      {!isAuthenticated && (
        <section aria-label="Today's Challenge" className="mb-8 p-6 rounded-2xl bg-green-50 border border-green-200">
          <p className="text-xs font-semibold uppercase tracking-widest text-green-600 mb-1">Today&apos;s Challenge</p>
          <p className="text-gray-700 mb-4">One song, same for everyone — come back tomorrow for a new one.</p>
          <a
            href={dailySessionId ? `/quiz/${dailySessionId}` : "/daily"}
            className="inline-block bg-green-500 text-white font-semibold px-6 py-3 rounded-full text-sm hover:bg-green-600 active:scale-95 transition-all"
          >
            Play
          </a>
        </section>
      )}

      {!isAuthenticated && (
        <>
          <p className="text-gray-500 mb-4">More modes</p>
          <div className="flex flex-col gap-4">
            {FLAVOR_MODES.map((m) => (
              <ModeCard
                key={m.flavor}
                title={m.title}
                description={m.description}
                onClick={() => startSession(m.flavor)}
              />
            ))}
            <ModeCard
              title="Streak"
              description="Keep answering correctly to build your streak"
              onClick={() => router.push("/streak")}
            />
          </div>
        </>
      )}

      {isAuthenticated && mode === "personal" && (
        <div className="flex flex-col gap-4">
          <ModeCard
            title="Artist"
            description="Deep-dive into a single artist's discography"
            onClick={() => startSession("artist")}
          />
          <ModeCard
            title="Streak"
            description="Keep answering correctly to build your streak"
            onClick={() => router.push("/streak")}
          />
          <ModeCard
            title="Daily Challenge"
            description="One song, same for everyone — come back tomorrow for a new one."
            onClick={() => router.push(dailySessionId ? `/quiz/${dailySessionId}` : "/daily")}
            badge="General"
          />
        </div>
      )}

      {isAuthenticated && mode === "general" && (
        <div className="flex flex-col gap-4">
          {FLAVOR_MODES.map((m) => (
            <ModeCard
              key={m.flavor}
              title={m.title}
              description={m.description}
              onClick={() => startSession(m.flavor)}
            />
          ))}
          <ModeCard
            title="Streak"
            description="Keep answering correctly to build your streak"
            onClick={() => router.push("/streak")}
          />
          <ModeCard
            title="Daily Challenge"
            description="One song, same for everyone — come back tomorrow for a new one."
            onClick={() => router.push(dailySessionId ? `/quiz/${dailySessionId}` : "/daily")}
          />
        </div>
      )}

      {!isAuthenticated && (
        <div className="mt-8 p-4 rounded-2xl bg-gray-50 border border-gray-200">
          <p className="font-semibold text-gray-900">Unlock Personal Mode</p>
          <p className="text-sm text-gray-600 mt-1">
            Connect Spotify to play quizzes built from your own listening history.
          </p>
          <a
            href="/api/auth/login"
            className="mt-3 inline-block bg-green-500 text-white font-semibold px-5 py-2 rounded-full text-sm hover:bg-green-600"
          >
            Connect Spotify
          </a>
        </div>
      )}
    </main>
  );
}
