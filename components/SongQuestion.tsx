'use client'

import { useState } from 'react'
import type { Question } from '@/types'

interface Props {
  question: Question
  onAnswer?: (answer: string) => void
}

export function SongQuestion({ question, onAnswer }: Props) {
  const [selected, setSelected] = useState<string | null>(null)

  function pick(option: string) {
    if (selected !== null) return
    setSelected(option)
    setTimeout(() => onAnswer?.(option), 700)
  }

  function stateFor(option: string): 'correct' | 'wrong' | undefined {
    if (selected === null) return undefined
    if (option === question.correct) return 'correct'
    if (option === selected) return 'wrong'
    return undefined
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {question.options.map((option) => {
        const state = stateFor(option)
        return (
          <button
            key={option}
            data-state={state}
            disabled={selected !== null}
            onClick={() => pick(option)}
            className="
              w-full py-4 px-5 rounded-2xl text-left font-semibold text-sm
              bg-[#1a1a1a] text-white
              data-[state=correct]:bg-green-600 data-[state=correct]:text-white
              data-[state=wrong]:bg-red-900/70 data-[state=wrong]:text-red-200
              disabled:cursor-default
              hover:bg-[#222] data-[state=correct]:hover:bg-green-600 data-[state=wrong]:hover:bg-red-900/70
              active:scale-[0.99] data-[state]:active:scale-100
              transition-all
            "
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}
