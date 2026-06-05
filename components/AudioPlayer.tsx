'use client'

import { useRef, useState } from 'react'

export function AudioPlayer({ previewUrl }: { previewUrl: string }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)

  function toggle() {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.play()
      setPlaying(true)
    }
  }

  return (
    <div>
      <audio
        ref={audioRef}
        src={previewUrl}
        onEnded={() => setPlaying(false)}
      />
      <button aria-label={playing ? 'Pause' : 'Play'} onClick={toggle}>
        {playing ? 'Pause' : 'Play'}
      </button>
    </div>
  )
}
