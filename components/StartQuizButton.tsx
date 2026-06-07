'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function StartQuizButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/quiz/personal', { method: 'POST' })
      if (res.status === 400) {
        setError('Not enough playable tracks in your library.')
        return
      }
      if (!res.ok) throw new Error('Unexpected error')
      const { sessionId } = await res.json() as { sessionId: string }
      router.push(`/quiz/${sessionId}`)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleClick}
        disabled={loading}
        className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? 'Building quiz…' : 'Start Quiz'}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
