'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Script from 'next/script'

interface Props {
  accessToken: string
  trackUri: string
}

export function SpotifyPlayer({ accessToken, trackUri }: Props) {
  const [isReady, setIsReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const playerRef = useRef<Spotify.Player | null>(null)
  const deviceIdRef = useRef<string | null>(null)

  const initPlayer = useCallback(() => {
    const player = new window.Spotify.Player({
      name: 'Know Your Music',
      getOAuthToken: (cb) => cb(accessToken),
      volume: 0.5,
    })

    player.addListener('ready', ({ device_id }) => {
      deviceIdRef.current = device_id
      setIsReady(true)
    })

    player.addListener('initialization_error', ({ message }) => {
      setError(`Init error: ${message}`)
    })

    player.addListener('authentication_error', ({ message }) => {
      setError(`Auth error: ${message}`)
    })

    player.addListener('account_error', ({ message }) => {
      setError(`Account error: ${message}`)
    })

    player.addListener('player_state_changed', (state) => {
      if (!state) return
      setIsPlaying(!state.paused)
    })

    player.connect()
    playerRef.current = player
  }, [accessToken])

  // Handle SPA navigation back to this page when SDK already loaded
  useEffect(() => {
    if (window.Spotify?.Player) {
      initPlayer()
    }
    return () => {
      playerRef.current?.disconnect()
    }
  }, [initPlayer])

  async function toggle() {
    const player = playerRef.current
    const deviceId = deviceIdRef.current
    if (!player || !deviceId || !isReady) return

    if (!hasStarted) {
      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uris: [trackUri] }),
      })
      setHasStarted(true)
    } else {
      await player.togglePlay()
    }
  }

  return (
    <>
      <Script
        src="https://sdk.scdn.co/spotify-player.js"
        strategy="afterInteractive"
        onLoad={initPlayer}
      />
      <button
        disabled={!isReady}
        onClick={toggle}
        aria-label={isPlaying ? 'Pause' : 'Play'}
        className="cursor-pointer rounded-full bg-green-600 px-8 py-3 text-lg font-bold text-white hover:bg-green-700 active:scale-95 disabled:opacity-50"
      >
        {isReady ? (isPlaying ? 'Pause' : 'Play') : 'Connecting…'}
      </button>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </>
  )
}
