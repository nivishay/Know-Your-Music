'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  icon: React.ReactNode
  title: string
  subtitle: string
  apiPath: string
}

export function QuizModeCard({ icon, title, subtitle, apiPath }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(apiPath, { method: 'POST' })
      if (res.status === 400) {
        setError('Not enough playable tracks in your library.')
        return
      }
      if (!res.ok) throw new Error('Unexpected error')
      const { sessionId } = (await res.json()) as { sessionId: string }
      router.push(`/quiz/${sessionId}`)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="w-full text-left bg-[#1a1a1a] rounded-2xl p-4 flex items-center gap-4 hover:bg-[#222] active:scale-[0.99] transition-all disabled:opacity-60"
    >
      <div className="w-12 h-12 rounded-xl bg-[#0f3320] flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-white leading-snug">
          {loading ? 'Building quiz…' : title}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      </div>
      <svg
        className="text-gray-500 flex-shrink-0"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  )
}
