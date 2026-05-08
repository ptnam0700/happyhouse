'use client'

import { cn } from '@/lib/utils'
import { Q_NAV_SECTION_NAMES } from '@/lib/test-utils'
import type { Question, Answers } from '@/types'

interface QuestionNavigatorProps {
  questions: Question[]
  answers: Answers
  currentGroupStart: number
  currentGroupEnd: number
  onJump: (idx: number) => void
}

export function QuestionNavigator({
  questions,
  answers,
  currentGroupStart,
  currentGroupEnd,
  onJump,
}: QuestionNavigatorProps) {
  let lastSection: string | null = null

  return (
    <div className="bg-white rounded-2xl px-4 py-3 mb-5 shadow-[0_2px_8px_rgba(26,39,68,0.07)]">
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200 pb-0.5">
        {questions.map((q, i) => {
          const isNewSection = q.section !== lastSection
          lastSection = q.section
          const isAnswered = answers[q.id] !== undefined
          const isCurrent = i >= currentGroupStart && i <= currentGroupEnd

          return (
            <div key={q.id} className="flex items-center gap-1.5 shrink-0">
              {isNewSection && (
                <>
                  {i > 0 && <span className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider px-1.5 opacity-60">|</span>}
                  <span className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider px-1.5 whitespace-nowrap opacity-60">
                    {Q_NAV_SECTION_NAMES[q.section] ?? q.section}
                  </span>
                </>
              )}
              <button
                onClick={() => onJump(i)}
                title={`Câu ${i + 1}`}
                className={cn(
                  'w-[30px] h-[30px] rounded-full border-[1.5px] text-[0.72rem] font-bold cursor-pointer transition-all shrink-0',
                  isAnswered && !isCurrent && 'bg-[#1A2744] text-white border-[#1A2744]',
                  isAnswered && isCurrent  && 'bg-[#E8303A] text-white border-[#E8303A] shadow-[0_0_0_2px_rgba(232,48,58,0.18)]',
                  !isAnswered && isCurrent  && 'border-[#E8303A] text-[#E8303A] shadow-[0_0_0_2px_rgba(232,48,58,0.18)] bg-white',
                  !isAnswered && !isCurrent && 'border-gray-200 text-gray-400 bg-white hover:border-[#1A2744] hover:text-[#1A2744]',
                )}
              >
                {i + 1}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
