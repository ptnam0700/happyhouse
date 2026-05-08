'use client'

import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TrueFalseProps {
  questionId: string
  selected: string | undefined
  onSelect: (qid: string, letter: 'A' | 'B') => void
}

export function TrueFalse({ questionId, selected, onSelect }: TrueFalseProps) {
  return (
    <div className="flex gap-4 mt-6">
      <button
        onClick={() => onSelect(questionId, 'A')}
        className={cn(
          'flex-1 flex items-center justify-center gap-2.5 py-[1.1rem] border-2 rounded-xl font-bold text-base cursor-pointer transition-all',
          selected === 'A'
            ? 'border-emerald-500 bg-emerald-50 text-emerald-500'
            : 'border-gray-200 bg-white text-gray-400 hover:border-[#1A2744] hover:text-[#1A2744]'
        )}
      >
        <Check size={18} strokeWidth={2.5} />
        True
      </button>
      <button
        onClick={() => onSelect(questionId, 'B')}
        className={cn(
          'flex-1 flex items-center justify-center gap-2.5 py-[1.1rem] border-2 rounded-xl font-bold text-base cursor-pointer transition-all',
          selected === 'B'
            ? 'border-[#E8303A] bg-red-50 text-[#E8303A]'
            : 'border-gray-200 bg-white text-gray-400 hover:border-[#1A2744] hover:text-[#1A2744]'
        )}
      >
        <X size={18} strokeWidth={2.5} />
        False
      </button>
    </div>
  )
}
