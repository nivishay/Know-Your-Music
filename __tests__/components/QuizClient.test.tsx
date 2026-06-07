// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react'
import { QuizClient } from '@/components/QuizClient'
import type { QuizSession, Clip, Question } from '@/types'

vi.mock('@/components/SpotifyPlayer', () => ({
  SpotifyPlayer: () => <div data-testid="spotify-player" />,
}))

function makeQuestion(correct: string): Question {
  return { correct, options: [correct, 'Option B', 'Option C', 'Option D'] }
}

function makeClip(i: number): Clip {
  return {
    trackId: `track-${i}`,
    previewUrl: `https://preview/${i}`,
    songName: `Song ${i}`,
    artistName: `Artist ${i}`,
    albumName: `Album ${i}`,
    albumYear: '2020',
    albumImageUrl: null,
    songQuestion: makeQuestion(`Song ${i}`),
    artistQuestion: makeQuestion(`Artist ${i}`),
  }
}

const session: QuizSession = {
  id: 'sess-1',
  userId: null,
  mode: 'personal',
  format: 'round',
  clips: Array.from({ length: 5 }, (_, i) => makeClip(i)),
  createdAt: '2024-01-01',
}

async function advance() {
  await act(async () => { await vi.runAllTimersAsync() })
}

describe('QuizClient', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response('{"ok":true}', { status: 200, headers: { 'Content-Type': 'application/json' } }),
    )
  })
  afterEach(() => {
    vi.useRealTimers()
    cleanup()
  })

  it('shows the first clip song question initially', () => {
    render(<QuizClient session={session} accessToken="tok" />)
    screen.getByText('Song 0') // throws if absent
    expect(screen.queryByText('Artist 0')).toBeNull()
  })

  it('renders a link back to /home', () => {
    render(<QuizClient session={session} accessToken="tok" />)
    const link = screen.getByRole('link', { name: /home/i }) as HTMLAnchorElement
    expect(link.href).toContain('/home')
  })

  it('advances to artist question after answering song question', async () => {
    render(<QuizClient session={session} accessToken="tok" />)
    fireEvent.click(screen.getByText('Song 0'))
    await advance()
    screen.getByText('Artist 0')
  })

  it('advances to next clip after answering artist question and clicking Next', async () => {
    render(<QuizClient session={session} accessToken="tok" />)
    fireEvent.click(screen.getByText('Song 0'))
    await advance()
    fireEvent.click(screen.getByText('Artist 0'))
    await advance()
    // Now in reveal phase — click Next Song to advance
    fireEvent.click(screen.getByText('Next Song →'))
    screen.getByText('Song 1')
  })

  it('shows Superfan results after all 10 correct answers and calls PATCH', async () => {
    render(<QuizClient session={session} accessToken="tok" />)
    for (let i = 0; i < 5; i++) {
      fireEvent.click(screen.getByText(`Song ${i}`))
      await advance()
      fireEvent.click(screen.getByText(`Artist ${i}`))
      await advance()
      fireEvent.click(screen.getByText(i < 4 ? 'Next Song →' : 'See Results'))
    }
    screen.getByText('10 / 10')
    screen.getByText('Superfan')
    expect(vi.mocked(globalThis.fetch)).toHaveBeenCalledWith(
      '/api/quiz/sess-1',
      expect.objectContaining({ method: 'PATCH' }),
    )
  })

  it('shows fun fact text in reveal phase when API returns a fact', async () => {
    vi.mocked(globalThis.fetch).mockImplementation((url) => {
      if (typeof url === 'string' && url.includes('/api/fun-fact')) {
        return Promise.resolve(new Response(
          JSON.stringify({ fact: 'This song was recorded in one take.' }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        ))
      }
      return Promise.resolve(new Response('{"ok":true}', { status: 200, headers: { 'Content-Type': 'application/json' } }))
    })
    render(<QuizClient session={session} accessToken="tok" />)
    fireEvent.click(screen.getByText('Song 0'))
    await advance()
    fireEvent.click(screen.getByText('Artist 0'))
    await advance()
    screen.getByTestId('fun-fact')
    screen.getByText('This song was recorded in one take.')
  })

  it('hides fun fact section when API returns null', async () => {
    vi.mocked(globalThis.fetch).mockImplementation((url) => {
      if (typeof url === 'string' && url.includes('/api/fun-fact')) {
        return Promise.resolve(new Response(
          JSON.stringify({ fact: null }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        ))
      }
      return Promise.resolve(new Response('{"ok":true}', { status: 200, headers: { 'Content-Type': 'application/json' } }))
    })
    render(<QuizClient session={session} accessToken="tok" />)
    fireEvent.click(screen.getByText('Song 0'))
    await advance()
    fireEvent.click(screen.getByText('Artist 0'))
    await advance()
    expect(screen.queryByTestId('fun-fact')).toBeNull()
  })

  it('score does not increment on wrong answers and shows bottom label', async () => {
    render(<QuizClient session={session} accessToken="tok" />)
    for (let i = 0; i < 5; i++) {
      fireEvent.click(screen.getByText('Option B'))
      await advance()
      fireEvent.click(screen.getByText('Option B'))
      await advance()
      fireEvent.click(screen.getByText(i < 4 ? 'Next Song →' : 'See Results'))
    }
    screen.getByText('0 / 10')
    screen.getByText('Who Are You?')
  })
})
