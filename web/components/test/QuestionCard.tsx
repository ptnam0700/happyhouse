'use client'

import { cn } from '@/lib/utils'
import { MultipleChoice } from './MultipleChoice'
import { TrueFalse } from './TrueFalse'
import { FillBlank } from './FillBlank'
import { AudioPlayer } from './AudioPlayer'
import { SECTION_LABELS } from '@/lib/test-utils'
import type { Question } from '@/types'

interface QuestionCardProps {
  question: Question
  questionNumber: number
  selected: string | undefined
  onAnswer: (qid: string, value: string) => void
  onRemoveAnswer?: (qid: string) => void
  compact?: boolean
  className?: string
}

function formatQuestionText(text: string, type: string) {
  if (type !== 'fill_blank') return text
  return text.replace(/__+/g, '<span class="inline-block min-w-[80px] border-b-2 border-[#1A2744] mx-1 align-bottom">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>')
}

export function QuestionCard({
  question,
  questionNumber,
  selected,
  onAnswer,
  onRemoveAnswer,
  compact = false,
  className,
}: QuestionCardProps) {
  const handleFillChange = (qid: string, value: string) => {
    const trimmed = value.trim()
    if (trimmed) {
      onAnswer(qid, trimmed)
    } else {
      onRemoveAnswer?.(qid)
    }
  }

  return (
    <div
      id={`q_${question.id}`}
      className={cn(
        'bg-white rounded-2xl shadow-[0_4px_24px_rgba(26,39,68,0.10)]',
        compact ? 'px-4 py-5 sm:px-7 sm:py-6 mb-3.5' : 'px-4 py-6 sm:px-10 sm:py-10 mb-6',
        className
      )}
    >
      {!compact && (
        <div className="inline-block bg-[#1A2744] text-white text-xs font-bold px-3.5 py-1 rounded-full mb-4 tracking-widest uppercase">
          {SECTION_LABELS[question.section] ?? question.section}
        </div>
      )}

      <div className={cn('text-xs text-gray-400 font-semibold uppercase tracking-widest', compact ? 'mb-1' : 'mb-2')}>
        Câu {questionNumber}
      </div>

      <div
        className={cn(
          'font-medium leading-relaxed text-[#1A2744]',
          compact ? 'text-[0.95rem] mb-4' : 'text-base sm:text-lg mb-6 sm:mb-8'
        )}
        dangerouslySetInnerHTML={{ __html: formatQuestionText(question.question, question.type) }}
      />

      {question.audio && !compact && (
        <AudioPlayer src={question.audio} audioId={question.id} className="mb-6" />
      )}

      {/* 'reading' and 'listening' are legacy aliases — render as multiple choice */}
      {(['multiple_choice', 'reading', 'listening'] as const).includes(question.type as any) && (
        <MultipleChoice
          questionId={question.id}
          options={question.options}
          selected={selected}
          onSelect={onAnswer}
        />
      )}

      {question.type === 'true_false' && (
        <TrueFalse
          questionId={question.id}
          selected={selected}
          onSelect={onAnswer}
        />
      )}

      {question.type === 'fill_blank' && (
        <FillBlank
          questionId={question.id}
          value={selected ?? ''}
          onChange={handleFillChange}
        />
      )}
    </div>
  )
}
