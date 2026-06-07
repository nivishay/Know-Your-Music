'use client'

import { useEffect, useRef, useState } from 'react'

interface SpotifyIframeController {
  play(): void
  pause(): void
  togglePlay(): void
  seek(positionMs: number): void
  loadUri(uri: string): void
  setVolume(volume: number): void
  addListener(event: string, callback: (e?: { data: { isPaused: boolean; position: number } }) => void): void
}

interface SpotifyIframeAPI {
  createController(
    element: HTMLElement,
    options: { uri: string; width: string; height: string },
    callback: (controller: SpotifyIframeController) => void
  ): void
}

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIframeAPI) => void
    spotifyIframeApi?: SpotifyIframeAPI
  }
}

interface Props {
  trackUri: string
}

export function SpotifyPlayer({ trackUri }: Props) {
  const [isReady, setIsReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const controllerRef = useRef<SpotifyIframeController | null>(null)
  const embedHostRef = useRef<HTMLDivElement | null>(null)
  const initialUriRef = useRef(trackUri)

  useEffect(() => {
    function initController(api: SpotifyIframeAPI) {
      if (!embedHostRef.current) return
      api.createController(
        embedHostRef.current,
        { uri: initialUriRef.current, width: '1', height: '1' },
        (controller) => {
          controllerRef.current = controller
          controller.addListener('ready', () => setIsReady(true))
          controller.addListener('playback_update', (e) => {
            if (e?.data) setIsPlaying(!e.data.isPaused)
          })
        }
      )
    }

    if (window.spotifyIframeApi) {
      initController(window.spotifyIframeApi)
    } else {
      window.onSpotifyIframeApiReady = (api) => {
        window.spotifyIframeApi = api
        initController(api)
      }
      if (!document.getElementById('spotify-iframe-api-script')) {
        const script = document.createElement('script')
        script.id = 'spotify-iframe-api-script'
        script.src = 'https://open.spotify.com/embed/iframe-api/v1'
        script.async = true
        document.body.appendChild(script)
      }
    }
  }, [])

  const mountedRef = useRef(false)
  useEffect(() => {
    if (!mountedRef.current) { mountedRef.current = true; return }
    const controller = controllerRef.current
    if (!controller) return
    setIsPlaying(false)
    controller.loadUri(trackUri)
  }, [trackUri])

  function toggle() {
    controllerRef.current?.togglePlay()
  }

  function replay() {
    const controller = controllerRef.current
    if (!controller) return
    controller.seek(0)
    if (!isPlaying) controller.togglePlay()
  }

  function toggleMute() {
    const controller = controllerRef.current
    if (!controller) return
    if (isMuted) {
      controller.setVolume(0.5)
      setIsMuted(false)
    } else {
      controller.setVolume(0)
      setIsMuted(true)
    }
  }

  return (
    <div className="w-full bg-[#1a1a1a] rounded-3xl px-6 py-5 flex flex-col items-center gap-4">
      <p className="text-xs text-gray-500 uppercase tracking-widest font-medium">
        {isReady ? 'Listen carefully' : 'Loading player…'}
      </p>

      {/* Hidden iframe mount point */}
      <div
        ref={embedHostRef}
        aria-hidden="true"
        style={{ position: 'fixed', bottom: 0, right: 0, width: 1, height: 1, overflow: 'hidden', opacity: 0 }}
      />

      <div className="flex items-center gap-8">
        {/* Restart */}
        <button
          onClick={replay}
          disabled={!isReady}
          aria-label="Restart"
          className="text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
          </svg>
        </button>

        {/* Play / Pause */}
        <button
          onClick={toggle}
          disabled={!isReady}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center hover:bg-green-400 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-green-900/40"
        >
          {!isReady ? (
            <svg className="animate-spin" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" width="22" height="22">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          ) : isPlaying ? (
            <svg viewBox="0 0 24 24" fill="white" width="22" height="22">
              <path d="M6 19h4V5H6zm8-14v14h4V5z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="white" width="22" height="22">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Mute */}
        <button
          onClick={toggleMute}
          disabled={!isReady}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
          className="text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
        >
          {isMuted ? (
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zM19 12c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
