'use client'

import { cn } from '@/lib/utils'
import type { TestType } from '@/types'

interface TestOptionCardProps {
  type: TestType
  selected: boolean
  onSelect: (type: TestType) => void
}

const config = {
  full: {
    bg: 'bg-[#E8303A]',
    minutes: 90,
    title: 'Full Placement Test',
    features: [
      'Ngữ pháp, Nghe, Đọc, Từ vựng',
      '95 câu hỏi toàn diện',
      'Kết quả chi tiết theo từng kỹ năng',
      'Band score IELTS ước tính',
    ],
  },
  mini: {
    bg: 'bg-[#1A2744]',
    minutes: 30,
    title: 'Mini Placement Test',
    features: [
      'Ngữ pháp + Từ vựng',
      'Đánh giá nhanh trình độ cơ bản',
      'Dành cho người mới bắt đầu',
      'Gợi ý lộ trình học phù hợp',
    ],
  },
}

export function TestOptionCard({ type, selected, onSelect }: TestOptionCardProps) {
  const c = config[type]

  return (
    <div
      onClick={() => onSelect(type)}
      className={cn(
        'rounded-2xl p-8 cursor-pointer transition-all border-[2.5px] text-white',
        c.bg,
        selected ? 'border-[#F5A623]' : 'border-transparent',
        'hover:-translate-y-1 hover:shadow-[0_4px_24px_rgba(26,39,68,0.15)]'
      )}
    >
      <div className="text-5xl font-extrabold leading-none">
        {c.minutes} <span className="text-base font-medium opacity-80">phút</span>
      </div>
      <div className="text-xl font-bold mt-2 mb-4">{c.title}</div>
      <ul className="space-y-1 list-none">
        {c.features.map((f, i) => (
          <li key={i} className="text-sm opacity-85">→ {f}</li>
        ))}
      </ul>
    </div>
  )
}
