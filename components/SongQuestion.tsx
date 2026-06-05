'use client'

import { useState } from 'react'
import type { Question } from '@/types'

export function SongQuestion({ question }: { question: Question }) {
  const [selected, setSelected] = useState<string | null>(null)

  function pick(option: string) {
    if (selected !== null) return
    setSelected(option)
  }

  function stateFor(option: string): string | undefined {
    if (selected === null) return undefined
    if (option === question.correct) return 'correct'
    if (option === selected) return 'wrong'
    return undefined
  }

  return (
    <div>
      <p>Name That Song</p>
      <div>
        {question.options.map((option) => (
          <button
            key={option}
            data-state={stateFor(option)}
            disabled={selected !== null}
            onClick={() => pick(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}
