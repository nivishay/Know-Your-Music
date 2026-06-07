// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react'
import { SpotifyPlayer } from '@/components/SpotifyPlayer'

type PlaybackUpdateListener = (e?: { data: { isPaused: boolean; position: number } }) => void
type ReadyListener = () => void

function makeIFrameMock() {
  const listeners: Record<string, PlaybackUpdateListener | ReadyListener> = {}
  const controller = {
    togglePlay: vi.fn(),
    seek: vi.fn(),
    loadUri: vi.fn(),
    play: vi.fn(),
    pause: vi.fn(),
    setVolume: vi.fn(),
    addListener: vi.fn((event: string, cb: PlaybackUpdateListener | ReadyListener) => {
      listeners[event] = cb
    }),
  }
  const api = {
    createController: vi.fn((_el: HTMLElement, _opts: unknown, callback: (c: typeof controller) => void) => {
      callback(controller)
    }),
  }
  return { api, controller, listeners }
}

describe('SpotifyPlayer', () => {
  let mock: ReturnType<typeof makeIFrameMock>

  beforeEach(() => {
    mock = makeIFrameMock()
    delete window.spotifyIframeApi
    delete window.onSpotifyIframeApiReady
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    delete window.spotifyIframeApi
    delete window.onSpotifyIframeApiReady
  })

  async function renderReady() {
    render(<SpotifyPlayer trackUri="spotify:track:abc" />)
    await act(async () => {
      window.onSpotifyIframeApiReady?.(mock.api)
      ;(mock.listeners['ready'] as ReadyListener)?.()
    })
  }

  it('shows disabled Play button until the IFrame API is ready', async () => {
    render(<SpotifyPlayer trackUri="spotify:track:abc" />)
    expect(screen.getByRole('button', { name: 'Play' }).hasAttribute('disabled')).toBe(true)

    await act(async () => {
      window.onSpotifyIframeApiReady?.(mock.api)
      ;(mock.listeners['ready'] as ReadyListener)?.()
    })

    expect(screen.getByRole('button', { name: 'Play' }).hasAttribute('disabled')).toBe(false)
  })

  it('calls togglePlay when Play is clicked', async () => {
    await renderReady()
    fireEvent.click(screen.getByRole('button', { name: 'Play' }))
    await act(async () => {})
    expect(mock.controller.togglePlay).toHaveBeenCalled()
  })

  it('shows Pause after playback_update reports isPaused=false', async () => {
    await renderReady()
    fireEvent.click(screen.getByRole('button', { name: 'Play' }))
    await act(async () => {
      ;(mock.listeners['playback_update'] as PlaybackUpdateListener)?.({ data: { isPaused: false, position: 0 } })
    })
    expect(screen.getByRole('button', { name: 'Pause' })).toBeTruthy()
  })

  it('calls togglePlay when Pause is clicked while playing', async () => {
    await renderReady()
    await act(async () => {
      ;(mock.listeners['playback_update'] as PlaybackUpdateListener)?.({ data: { isPaused: false, position: 0 } })
    })
    mock.controller.togglePlay.mockClear()
    fireEvent.click(screen.getByRole('button', { name: 'Pause' }))
    await act(async () => {})
    expect(mock.controller.togglePlay).toHaveBeenCalled()
  })

  it('calls loadUri when trackUri prop changes', async () => {
    const { rerender } = render(<SpotifyPlayer trackUri="spotify:track:first" />)
    await act(async () => {
      window.onSpotifyIframeApiReady?.(mock.api)
      ;(mock.listeners['ready'] as ReadyListener)?.()
    })

    rerender(<SpotifyPlayer trackUri="spotify:track:second" />)
    await act(async () => {})

    expect(mock.controller.loadUri).toHaveBeenCalledWith('spotify:track:second')
  })

  it('resets to Play when trackUri changes', async () => {
    const { rerender } = render(<SpotifyPlayer trackUri="spotify:track:first" />)
    await act(async () => {
      window.onSpotifyIframeApiReady?.(mock.api)
      ;(mock.listeners['ready'] as ReadyListener)?.()
      ;(mock.listeners['playback_update'] as PlaybackUpdateListener)?.({ data: { isPaused: false, position: 0 } })
    })
    expect(screen.getByRole('button', { name: 'Pause' })).toBeTruthy()

    rerender(<SpotifyPlayer trackUri="spotify:track:second" />)
    await act(async () => {})

    expect(screen.getByRole('button', { name: 'Play' })).toBeTruthy()
  })

  it('calls seek(0) when Restart is clicked while playing', async () => {
    await renderReady()
    await act(async () => {
      ;(mock.listeners['playback_update'] as PlaybackUpdateListener)?.({ data: { isPaused: false, position: 2000 } })
    })
    fireEvent.click(screen.getByRole('button', { name: 'Restart' }))
    await act(async () => {})
    expect(mock.controller.seek).toHaveBeenCalledWith(0)
  })
})
