'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function ArtistSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const artistName = query.trim()
    if (!artistName) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/quiz/artist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artistName }),
      })
      if (res.status === 422) {
        const body = await res.json()
        setError(body.error ?? `Not enough playable tracks for ${artistName} — try another.`)
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
    <form role="search" onSubmit={handleSubmit} className="relative my-4">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        width="16"
        height="16"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        className="w-full bg-[#1a1a1a] rounded-full py-2.5 pl-9 pr-4 text-sm placeholder:text-gray-500 outline-none focus:ring-1 focus:ring-green-600 disabled:opacity-60"
        placeholder="Search artists..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={loading}
      />
      {error && (
        <p className="mt-2 text-xs text-red-400 px-1">{error}</p>
      )}
    </form>
  )
}
