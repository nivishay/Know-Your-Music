// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react'
import { ArtistCard } from '@/components/ArtistCard'

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

describe('ArtistCard', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockPush.mockReset()
    globalThis.fetch = vi.fn()
  })
  afterEach(() => {
    vi.useRealTimers()
    cleanup()
  })

  it('renders artist name', () => {
    render(<ArtistCard artistName="Radiohead" imageUrl={null} />)
    screen.getByText('Radiohead')
  })

  it('POSTs to /api/quiz/artist with artistName on click', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify({ sessionId: 'sess-1' }), { status: 200 }),
    )
    render(<ArtistCard artistName="Radiohead" imageUrl={null} />)
    fireEvent.click(screen.getByRole('button'))
    await act(async () => { await vi.runAllTimersAsync() })

    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/quiz/artist',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ artistName: 'Radiohead' }),
      }),
    )
  })

  it('navigates to /quiz/[sessionId] on success', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify({ sessionId: 'sess-42' }), { status: 200 }),
    )
    render(<ArtistCard artistName="Radiohead" imageUrl={null} />)
    fireEvent.click(screen.getByRole('button'))
    await act(async () => { await vi.runAllTimersAsync() })

    expect(mockPush).toHaveBeenCalledWith('/quiz/sess-42')
  })

  it('shows inline error when API returns 422', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(
        JSON.stringify({ error: 'Not enough playable tracks for Radiohead — try another.' }),
        { status: 422 },
      ),
    )
    render(<ArtistCard artistName="Radiohead" imageUrl={null} />)
    fireEvent.click(screen.getByRole('button'))
    await act(async () => { await vi.runAllTimersAsync() })

    screen.getByText(/Not enough playable tracks for Radiohead/)
    expect(mockPush).not.toHaveBeenCalled()
  })
})
