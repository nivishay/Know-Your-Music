'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

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
    console.log('[SpotifyPlayer] initPlayer called')
    const player = new window.Spotify.Player({
      name: 'Know Your Music',
      getOAuthToken: (cb) => cb(accessToken),
      volume: 0.5,
    })

    player.addListener('ready', ({ device_id }) => {
      console.log('[SpotifyPlayer] ready, device_id:', device_id)
      deviceIdRef.current = device_id
      setIsReady(true)
    })

    player.addListener('not_ready', ({ device_id }) => {
      console.warn('[SpotifyPlayer] not_ready, device_id:', device_id)
    })

    player.addListener('initialization_error', ({ message }) => {
      console.error('[SpotifyPlayer] initialization_error:', message)
      setError(`Init error: ${message}`)
    })

    player.addListener('authentication_error', ({ message }) => {
      console.error('[SpotifyPlayer] authentication_error:', message)
      setError(`Auth error: ${message}`)
    })

    player.addListener('account_error', ({ message }) => {
      console.error('[SpotifyPlayer] account_error:', message)
      setError(`Account error: ${message}`)
    })

    player.addListener('player_state_changed', (state) => {
      if (!state) return
      setIsPlaying(!state.paused)
    })

    player.connect().then((ok) => console.log('[SpotifyPlayer] connect() resolved:', ok))
    playerRef.current = player
  }, [accessToken])

  useEffect(() => {
    if (window.Spotify?.Player) {
      // SDK already loaded (SPA navigation back to this page)
      initPlayer()
    } else {
      // Set callback before injecting the script so the SDK can call it on load
      window.onSpotifyWebPlaybackSDKReady = initPlayer
      const script = document.createElement('script')
      script.src = 'https://sdk.scdn.co/spotify-player.js'
      document.body.appendChild(script)
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
