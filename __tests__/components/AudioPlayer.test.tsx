// @vitest-environment jsdom
import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest'
import { render, fireEvent, cleanup } from '@testing-library/react'
import { AudioPlayer } from '@/components/AudioPlayer'

const PREVIEW_URL = 'https://preview.example.com/track'

afterEach(cleanup)

beforeAll(() => {
  Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
    writable: true,
    value: vi.fn().mockResolvedValue(undefined),
  })
  Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', {
    writable: true,
    value: vi.fn(),
  })
})

describe('AudioPlayer', () => {
  it('renders a play button', () => {
    const { getByRole } = render(<AudioPlayer previewUrl={PREVIEW_URL} />)
    expect(getByRole('button', { name: /play/i })).toBeTruthy()
  })

  it('shows pause after clicking play', () => {
    const { getByRole } = render(<AudioPlayer previewUrl={PREVIEW_URL} />)
    fireEvent.click(getByRole('button', { name: /play/i }))
    expect(getByRole('button', { name: /pause/i })).toBeTruthy()
  })

  it('shows play again after clicking pause', () => {
    const { getByRole } = render(<AudioPlayer previewUrl={PREVIEW_URL} />)
    fireEvent.click(getByRole('button', { name: /play/i }))
    fireEvent.click(getByRole('button', { name: /pause/i }))
    expect(getByRole('button', { name: /play/i })).toBeTruthy()
  })

  it('shows play again after audio ends (replay)', () => {
    const { getByRole, container } = render(<AudioPlayer previewUrl={PREVIEW_URL} />)
    fireEvent.click(getByRole('button', { name: /play/i }))
    const audio = container.querySelector('audio')!
    fireEvent(audio, new Event('ended'))
    expect(getByRole('button', { name: /play/i })).toBeTruthy()
  })
})
