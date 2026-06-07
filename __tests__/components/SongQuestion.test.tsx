// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, fireEvent, cleanup, act } from '@testing-library/react'
import { SongQuestion } from '@/components/SongQuestion'
import type { Question } from '@/types'

afterEach(cleanup)

const question: Question = {
  correct: 'Right Song',
  options: ['Wrong One', 'Right Song', 'Also Wrong', 'Still Wrong'],
}

describe('SongQuestion', () => {
  it('renders 4 option buttons', () => {
    const { getAllByRole } = render(<SongQuestion question={question} />)
    expect(getAllByRole('button')).toHaveLength(4)
  })

  it('all buttons are enabled before any selection', () => {
    const { getAllByRole } = render(<SongQuestion question={question} />)
    for (const btn of getAllByRole('button')) {
      expect((btn as HTMLButtonElement).disabled).toBe(false)
    }
  })

  it('correct answer marks that button as correct', () => {
    const { getByText } = render(<SongQuestion question={question} />)
    fireEvent.click(getByText('Right Song'))
    expect(getByText('Right Song').getAttribute('data-state')).toBe('correct')
  })

  it('wrong answer marks picked button wrong and reveals correct', () => {
    const { getByText } = render(<SongQuestion question={question} />)
    fireEvent.click(getByText('Wrong One'))
    expect(getByText('Wrong One').getAttribute('data-state')).toBe('wrong')
    expect(getByText('Right Song').getAttribute('data-state')).toBe('correct')
  })

  it('all buttons are locked after any selection', () => {
    const { getAllByRole, getByText } = render(<SongQuestion question={question} />)
    fireEvent.click(getByText('Wrong One'))
    for (const btn of getAllByRole('button')) {
      expect((btn as HTMLButtonElement).disabled).toBe(true)
    }
  })

  it('calls onAnswer with selected option after a short delay', async () => {
    vi.useFakeTimers()
    const onAnswer = vi.fn()
    const { getByText } = render(<SongQuestion question={question} onAnswer={onAnswer} />)
    fireEvent.click(getByText('Right Song'))
    expect(onAnswer).not.toHaveBeenCalled()
    await act(async () => { vi.runAllTimers() })
    expect(onAnswer).toHaveBeenCalledWith('Right Song')
    vi.useRealTimers()
  })
})
