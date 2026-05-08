'use client'

import { cn } from '@/lib/utils'

interface MultipleChoiceProps {
  questionId: string
  options: string[]
  selected: string | undefined
  onSelect: (qid: string, letter: string) => void
}

const LETTERS = ['A', 'B', 'C', 'D']

export function MultipleChoice({ questionId, options, selected, onSelect }: MultipleChoiceProps) {
  return (
    <ul className="flex flex-col gap-2.5 list-none">
      {options.map((opt, i) => {
        const letter = LETTERS[i]
        const isSelected = selected === letter
        return (
          <li
            key={letter}
            onClick={() => onSelect(questionId, letter)}
            className={cn(
              'flex items-start gap-3 px-5 py-4 border-[1.5px] rounded-xl cursor-pointer transition-all',
              isSelected
                ? 'border-[#E8303A] bg-red-50'
                : 'border-gray-200 bg-white hover:border-[#1A2744] hover:bg-[#F8F9FF]'
            )}
          >
            <div
              className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-all',
                isSelected
                  ? 'bg-[#E8303A] text-white'
                  : 'bg-[#F7F6F2] text-gray-400'
              )}
            >
              {letter}
            </div>
            <span className="text-[0.95rem] leading-relaxed pt-0.5">{opt}</span>
          </li>
        )
      })}
    </ul>
  )
}
