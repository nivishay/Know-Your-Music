"use client";

import { useRef, useState } from "react";

interface AudioPlayerProps {
  previewUrl: string;
  // These props are accepted but intentionally never rendered — the player shows zero identifying info
  songTitle?: string;
  artistName?: string;
  albumArtUrl?: string;
}

export function AudioPlayer({ previewUrl }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().catch(() => setPlaying(false));
      setPlaying(true);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <audio ref={audioRef} src={previewUrl} onEnded={() => setPlaying(false)} />
      <button
        onClick={toggle}
        aria-label={playing ? "Pause" : "Play"}
        className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center text-white text-3xl"
      >
        {playing ? "⏸" : "▶"}
      </button>
    </div>
  );
}
