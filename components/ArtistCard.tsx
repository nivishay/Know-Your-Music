'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  artistName: string
  imageUrl: string | null
}

export function ArtistCard({ artistName, imageUrl }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
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
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex-none w-36 text-left disabled:opacity-60"
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={artistName}
          className="w-36 h-36 rounded-xl object-cover"
        />
      ) : (
        <div className="w-36 h-36 rounded-xl bg-[#1a1a1a] flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="#9ca3af" width="40" height="40">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
          </svg>
        </div>
      )}
      <p className="mt-2 text-sm font-medium text-center truncate">
        {loading ? '…' : artistName}
      </p>
      {error && (
        <p className="mt-1 text-xs text-red-400 text-center leading-tight">{error}</p>
      )}
    </button>
  )
}
