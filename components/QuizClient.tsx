'use client'

import { useRef, useState } from 'react'
import { SpotifyPlayer } from '@/components/SpotifyPlayer'
import { SongQuestion } from '@/components/SongQuestion'
import type { QuizSession, ScoreLabel } from '@/types'

type Phase = 'song' | 'artist' | 'reveal'

function getScoreLabel(score: number, total: number): ScoreLabel {
  const pct = score / total
  if (pct === 1) return 'Superfan'
  if (pct >= 0.8) return 'True Fan'
  if (pct >= 0.5) return 'Casual Listener'
  if (pct >= 0.3) return 'Just Passing Through'
  return 'Who Are You?'
}

interface Props {
  session: QuizSession
  accessToken: string
}

export function QuizClient({ session }: Props) {
  const [clipIdx, setClipIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>('song')
  const [clipSongCorrect, setClipSongCorrect] = useState(false)
  const [clipArtistCorrect, setClipArtistCorrect] = useState(false)
  const [done, setDone] = useState(false)
  const [finalScore, setFinalScore] = useState(0)
  const scoreRef = useRef(0)

  const clip = session.clips[clipIdx]
  const totalClips = session.clips.length
  const totalPossible = totalClips * 2
  const completedQuestions =
    clipIdx * 2 + (phase === 'song' ? 0 : phase === 'artist' ? 1 : 2)

  function handleSongAnswer(answer: string) {
    const correct = answer === clip.songQuestion.correct
    if (correct) scoreRef.current += 1
    setClipSongCorrect(correct)
    setPhase('artist')
  }

  function handleArtistAnswer(answer: string) {
    const correct = answer === clip.artistQuestion.correct
    if (correct) scoreRef.current += 1
    setClipArtistCorrect(correct)
    setPhase('reveal')
  }

  function handleNext() {
    const isLast = clipIdx === totalClips - 1
    if (isLast) {
      const fs = scoreRef.current
      setFinalScore(fs)
      setDone(true)
      fetch(`/api/quiz/${session.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: fs, totalPossible }),
      }).catch(console.error)
    } else {
      setClipIdx((i) => i + 1)
      setPhase('song')
      setClipSongCorrect(false)
      setClipArtistCorrect(false)
    }
  }

  if (done) {
    const label = getScoreLabel(finalScore, totalPossible)
    return (
      <main className="min-h-dvh bg-[#0d0d0d] text-white flex flex-col items-center justify-center gap-5 p-8">
        <p className="text-sm text-gray-400 uppercase tracking-widest">Quiz Complete</p>
        <p className="text-6xl font-bold text-green-400">{finalScore} / {totalPossible}</p>
        <p className="text-2xl font-bold">{label}</p>
        <a
          href="/home"
          className="mt-4 px-8 py-3 bg-green-500 rounded-full font-bold hover:bg-green-400 transition-colors"
        >
          Play Again
        </a>
      </main>
    )
  }

  return (
    <main className="min-h-dvh bg-[#0d0d0d] text-white flex flex-col px-5 pt-6 pb-6 max-w-md mx-auto">
      {/* Top bar */}
      <div className="flex items-center mb-4">
        <a href="/home" aria-label="Home" className="text-gray-400 hover:text-white transition-colors p-1 -ml-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </a>
        <span className="ml-auto text-xs text-gray-500 font-medium">
          {clipIdx + 1} / {totalClips}
        </span>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5 justify-center mb-5 flex-wrap">
        {Array.from({ length: totalPossible }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i < completedQuestions ? 'bg-green-500 w-5' : 'bg-[#2a2a2a] w-1.5'
            }`}
          />
        ))}
      </div>

      {/* Player */}
      <div className="mb-5">
        <SpotifyPlayer trackUri={`spotify:track:${clip.trackId}`} />
      </div>

      {phase === 'reveal' ? (
        <>
          {/* Result pills */}
          <div className="flex gap-3 justify-center mb-4">
            <span className={`px-5 py-2 rounded-full text-sm font-semibold ${
              clipSongCorrect ? 'bg-green-900/60 text-green-300' : 'bg-red-900/60 text-red-300'
            }`}>
              Song: {clipSongCorrect ? '✓' : '✗'}
            </span>
            <span className={`px-5 py-2 rounded-full text-sm font-semibold ${
              clipArtistCorrect ? 'bg-green-900/60 text-green-300' : 'bg-red-900/60 text-red-300'
            }`}>
              Artist: {clipArtistCorrect ? '✓' : '✗'}
            </span>
          </div>

          {/* Song info card */}
          <div className="bg-[#1a1a1a] rounded-2xl p-4 flex gap-4 items-center">
            {clip.albumImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={clip.albumImageUrl}
                alt={clip.albumName}
                className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-[#2a2a2a] flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" fill="#9ca3af" width="28" height="28">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </div>
            )}
            <div className="min-w-0">
              <p className="font-bold truncate">{clip.songName}</p>
              <p className="text-sm text-gray-400 truncate">{clip.artistName}</p>
              <p className="text-xs text-gray-500 mt-0.5">{clip.albumName} • {clip.albumYear}</p>
            </div>
          </div>

          <div className="flex-1" />

          {/* Next button */}
          <button
            onClick={handleNext}
            className="w-full py-4 bg-green-500 rounded-full font-bold text-lg hover:bg-green-400 active:scale-[0.98] transition-all mt-5"
          >
            {clipIdx === totalClips - 1 ? 'See Results' : 'Next Song →'}
          </button>
        </>
      ) : (
        <>
          <p className="text-center text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
            {phase === 'song' ? 'Name That Song' : 'Who is the Artist?'}
          </p>
          <SongQuestion
            key={`${clipIdx}-${phase}`}
            question={phase === 'song' ? clip.songQuestion : clip.artistQuestion}
            onAnswer={phase === 'song' ? handleSongAnswer : handleArtistAnswer}
          />
        </>
      )}
    </main>
  )
}
