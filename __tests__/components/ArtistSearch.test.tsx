// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react'
import { ArtistSearch } from '@/components/ArtistSearch'

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

describe('ArtistSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockPush.mockReset()
    globalThis.fetch = vi.fn()
  })
  afterEach(() => {
    vi.useRealTimers()
    cleanup()
  })

  it('renders a search input', () => {
    render(<ArtistSearch />)
    screen.getByPlaceholderText(/search artists/i)
  })

  it('POSTs to /api/quiz/artist on form submit with typed artist name', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify({ sessionId: 'sess-search-1' }), { status: 200 }),
    )
    render(<ArtistSearch />)
    fireEvent.change(screen.getByPlaceholderText(/search artists/i), {
      target: { value: 'Tame Impala' },
    })
    fireEvent.submit(screen.getByRole('search'))
    await act(async () => { await vi.runAllTimersAsync() })

    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/quiz/artist',
      expect.objectContaining({ body: JSON.stringify({ artistName: 'Tame Impala' }) }),
    )
  })

  it('navigates to /quiz/[sessionId] on success', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify({ sessionId: 'sess-99' }), { status: 200 }),
    )
    render(<ArtistSearch />)
    fireEvent.change(screen.getByPlaceholderText(/search artists/i), {
      target: { value: 'Tame Impala' },
    })
    fireEvent.submit(screen.getByRole('search'))
    await act(async () => { await vi.runAllTimersAsync() })

    expect(mockPush).toHaveBeenCalledWith('/quiz/sess-99')
  })

  it('shows inline error on 422', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(
        JSON.stringify({ error: 'Not enough playable tracks for Tame Impala — try another.' }),
        { status: 422 },
      ),
    )
    render(<ArtistSearch />)
    fireEvent.change(screen.getByPlaceholderText(/search artists/i), {
      target: { value: 'Tame Impala' },
    })
    fireEvent.submit(screen.getByRole('search'))
    await act(async () => { await vi.runAllTimersAsync() })

    screen.getByText(/Not enough playable tracks for Tame Impala/)
  })
})
