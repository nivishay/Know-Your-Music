'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface Props {
  accessToken: string
  trackUri: string
  previewUrl?: string | null
}

// --- Mobile / preview fallback ---

function PreviewPlayer({ previewUrl }: { previewUrl: string | null | undefined }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  if (!previewUrl) {
    return (
      <p className="text-sm text-gray-400 text-center">
        No 30-second preview available for this track.
      </p>
    )
  }

  async function toggle() {
    const el = audioRef.current
    if (!el) return
    if (isPlaying) {
      el.pause()
      setIsPlaying(false)
    } else {
      await el.play()
      setIsPlaying(true)
    }
  }

  function replay() {
    const el = audioRef.current
    if (!el) return
    el.currentTime = 0
    el.play().then(() => setIsPlaying(true))
  }

  function toggleMute() {
    const el = audioRef.current
    if (!el) return
    el.muted = !el.muted
    setIsMuted(el.muted)
  }

  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} src={previewUrl} onEnded={() => setIsPlaying(false)} />
      <PlayerControls
        isReady
        isPlaying={isPlaying}
        isMuted={isMuted}
        onToggle={toggle}
        onReplay={replay}
        onToggleMute={toggleMute}
      />
    </>
  )
}

// --- SDK player ---

function SdkPlayer({ accessToken, trackUri }: { accessToken: string; trackUri: string }) {
  const [isReady, setIsReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
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

    player.addListener('not_ready', () => {})

    player.addListener('initialization_error', ({ message }) => setError(`Init error: ${message}`))
    player.addListener('authentication_error', ({ message }) => setError(`Auth error: ${message}`))
    player.addListener('account_error', ({ message }) => setError(`Account error: ${message}`))

    player.addListener('player_state_changed', (state) => {
      if (!state) return
      setIsPlaying(!state.paused)
    })

    player.connect().then((ok) => console.log('[SpotifyPlayer] connect():', ok))
    playerRef.current = player
  }, [accessToken])

  useEffect(() => {
    if (window.Spotify?.Player) {
      initPlayer()
    } else {
      window.onSpotifyWebPlaybackSDKReady = initPlayer
      const script = document.createElement('script')
      script.src = 'https://sdk.scdn.co/spotify-player.js'
      document.body.appendChild(script)
    }
    return () => { playerRef.current?.disconnect() }
  }, [initPlayer])

  const mountedRef = useRef(false)
  useEffect(() => {
    if (!mountedRef.current) { mountedRef.current = true; return }
    setHasStarted(false)
    setIsPlaying(false)
    fetch('https://api.spotify.com/v1/me/player/pause', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${accessToken}` },
    }).catch(() => {})
  }, [trackUri, accessToken])

  async function startPlayback() {
    const deviceId = deviceIdRef.current
    if (!deviceId) return
    await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ uris: [trackUri] }),
    })
    setHasStarted(true)
  }

  async function toggle() {
    if (!isReady) return
    if (!hasStarted) { await startPlayback(); return }
    if (isPlaying) {
      await fetch('https://api.spotify.com/v1/me/player/pause', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      setIsPlaying(false)
    } else {
      const deviceId = deviceIdRef.current
      if (!deviceId) return
      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      setIsPlaying(true)
    }
  }

  async function replay() {
    if (!isReady) return
    await startPlayback()
  }

  async function toggleMute() {
    const player = playerRef.current
    if (!player) return
    if (isMuted) { await player.setVolume(0.5); setIsMuted(false) }
    else { await player.setVolume(0); setIsMuted(true) }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-sm text-red-400">{error}</p>
        <p className="text-xs text-gray-400">
          Try{' '}
          <a href="/auth/login" className="underline">re-logging in</a>
          {' '}— your session may be missing the <code>streaming</code> scope.
        </p>
      </div>
    )
  }

  return (
    <PlayerControls
      isReady={isReady}
      isPlaying={isPlaying}
      isMuted={isMuted}
      onToggle={toggle}
      onReplay={replay}
      onToggleMute={toggleMute}
    />
  )
}

// --- Shared controls UI ---

interface ControlsProps {
  isReady: boolean
  isPlaying: boolean
  isMuted: boolean
  onToggle: () => void
  onReplay: () => void
  onToggleMute: () => void
}

function PlayerControls({ isReady, isPlaying, isMuted, onToggle, onReplay, onToggleMute }: ControlsProps) {
  return (
    <div className="flex items-center gap-10">
      <button
        onClick={onReplay}
        disabled={!isReady}
        aria-label="Restart"
        className="text-gray-300 hover:text-white disabled:opacity-30 transition-colors"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26">
          <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
        </svg>
      </button>

      <button
        onClick={onToggle}
        disabled={!isReady}
        aria-label={isPlaying ? 'Pause' : 'Play'}
        className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center hover:bg-green-400 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-green-900/40"
      >
        {!isReady ? (
          <svg className="animate-spin" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" width="24" height="24">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        ) : isPlaying ? (
          <svg viewBox="0 0 24 24" fill="white" width="24" height="24">
            <path d="M6 19h4V5H6zm8-14v14h4V5z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="white" width="24" height="24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      <button
        onClick={onToggleMute}
        aria-label={isMuted ? 'Unmute' : 'Mute'}
        className="text-gray-300 hover:text-white transition-colors"
      >
        {isMuted ? (
          <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26">
            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zM19 12c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
          </svg>
        )}
      </button>
    </div>
  )
}

// --- Public export ---

export function SpotifyPlayer({ accessToken, trackUri, previewUrl }: Props) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent))
  }, [])

  if (isMobile) {
    return <PreviewPlayer previewUrl={previewUrl} />
  }

  return <SdkPlayer accessToken={accessToken} trackUri={trackUri} />
}
