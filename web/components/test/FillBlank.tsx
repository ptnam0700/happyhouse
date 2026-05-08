'use client'

interface FillBlankProps {
  questionId: string
  value: string
  onChange: (qid: string, value: string) => void
}

export function FillBlank({ questionId, value, onChange }: FillBlankProps) {
  return (
    <div className="mt-6">
      <div className="flex items-center gap-2.5 bg-[#F8F9FF] border-[1.5px] border-gray-200 rounded-xl px-4 py-3 focus-within:border-[#E8303A] transition-colors">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">
          Answer:
        </span>
        <input
          type="text"
          value={value}
          onChange={e => onChange(questionId, e.target.value)}
          placeholder="Type your answer..."
          autoComplete="off"
          spellCheck={false}
          className="flex-1 bg-transparent border-none outline-none text-base text-[#1A2744] placeholder:text-gray-300"
        />
      </div>
    </div>
  )
}
