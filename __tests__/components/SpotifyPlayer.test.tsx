// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react'
import { SpotifyPlayer } from '@/components/SpotifyPlayer'

type Listener = (data: Record<string, unknown>) => void

function makeSpotifyMock() {
  const listeners: Record<string, Listener> = {}
  const player = {
    addListener: vi.fn((event: string, cb: Listener) => { listeners[event] = cb }),
    connect: vi.fn().mockResolvedValue(true),
    disconnect: vi.fn(),
    setVolume: vi.fn().mockResolvedValue(undefined),
  }
  // eslint-disable-next-line prefer-arrow-callback
  return { player, listeners, Player: vi.fn().mockImplementation(function () { return player }) }
}

describe('SpotifyPlayer', () => {
  let spotify: ReturnType<typeof makeSpotifyMock>

  beforeEach(() => {
    spotify = makeSpotifyMock()
    Object.assign(window, { Spotify: { Player: spotify.Player } })
    globalThis.fetch = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  async function renderReady() {
    render(<SpotifyPlayer accessToken="tok" trackUri="spotify:track:abc" />)
    await act(async () => {
      spotify.listeners['ready']?.({ device_id: 'dev-1' })
    })
  }

  async function startAndPlay() {
    fireEvent.click(screen.getByRole('button', { name: 'Play' }))
    await act(async () => {})
    // SDK reports playing state
    await act(async () => {
      spotify.listeners['player_state_changed']?.({ paused: false })
    })
  }

  it('sends PUT /me/player/pause when toggling off while playing', async () => {
    await renderReady()
    await startAndPlay()
    vi.mocked(fetch).mockClear()

    fireEvent.click(screen.getByRole('button', { name: 'Pause' }))
    await act(async () => {})

    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      'https://api.spotify.com/v1/me/player/pause',
      expect.objectContaining({ method: 'PUT' }),
    )
  })

  it('sends PUT /me/player/play when resuming while paused', async () => {
    await renderReady()
    await startAndPlay()
    // Pause
    fireEvent.click(screen.getByRole('button', { name: 'Pause' }))
    await act(async () => {
      spotify.listeners['player_state_changed']?.({ paused: true })
    })
    vi.mocked(fetch).mockClear()

    // Resume
    fireEvent.click(screen.getByRole('button', { name: 'Play' }))
    await act(async () => {})

    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      expect.stringContaining('/me/player/play?device_id=dev-1'),
      expect.objectContaining({ method: 'PUT' }),
    )
  })

  it('shows Play button when trackUri prop changes (resets started state)', async () => {
    const { rerender } = render(
      <SpotifyPlayer accessToken="tok" trackUri="spotify:track:first" />,
    )
    await act(async () => {
      spotify.listeners['ready']?.({ device_id: 'dev-1' })
    })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Play' }))
    })
    await act(async () => {
      spotify.listeners['player_state_changed']?.({ paused: false })
    })
    expect(screen.queryByRole('button', { name: 'Pause' })).toBeTruthy()

    rerender(<SpotifyPlayer accessToken="tok" trackUri="spotify:track:second" />)
    await act(async () => {})

    expect(screen.getByRole('button', { name: 'Play' })).toBeTruthy()
  })

  it('sends PUT pause when trackUri changes while playing', async () => {
    const { rerender } = render(
      <SpotifyPlayer accessToken="tok" trackUri="spotify:track:first" />,
    )
    await act(async () => { spotify.listeners['ready']?.({ device_id: 'dev-1' }) })
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Play' })) })
    await act(async () => { spotify.listeners['player_state_changed']?.({ paused: false }) })
    vi.mocked(fetch).mockClear()

    rerender(<SpotifyPlayer accessToken="tok" trackUri="spotify:track:second" />)
    await act(async () => {})

    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      'https://api.spotify.com/v1/me/player/pause',
      expect.objectContaining({ method: 'PUT' }),
    )
  })

  it('re-calls the play API when replay is clicked after starting', async () => {
    await renderReady()
    await startAndPlay()
    vi.mocked(fetch).mockClear()

    fireEvent.click(screen.getByRole('button', { name: 'Restart' }))
    await act(async () => {})

    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      expect.stringContaining('/me/player/play?device_id=dev-1'),
      expect.objectContaining({ method: 'PUT' }),
    )
  })
})
