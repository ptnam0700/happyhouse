'use client'

import { useActionState } from 'react'
import { createTest } from '../actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

const TIME_PRESETS = [
  { label: '30 phút', value: 1800 },
  { label: '45 phút', value: 2700 },
  { label: '60 phút', value: 3600 },
  { label: '90 phút', value: 5400 },
]

export default function NewTestPage() {
  const [, action, pending] = useActionState(createTest, undefined)

  return (
    <div className="p-4 sm:p-8 max-w-xl">
      <Link href="/admin/tests" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#1A2744] mb-6 transition-colors">
        <ChevronLeft size={16} /> Danh sách bài test
      </Link>
      <h1 className="text-xl font-bold text-[#1A2744] mb-6">Tạo bài kiểm tra mới</h1>

      <form action={action} className="bg-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(26,39,68,0.08)] space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tên bài test *</label>
          <Input name="name" required placeholder="VD: IELTS Entry Test — Tháng 6/2025"
            className="h-11 border-gray-200 rounded-xl focus-visible:border-[#E8303A] focus-visible:ring-0" />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Mô tả (tuỳ chọn)</label>
          <textarea name="description" rows={3} placeholder="Mô tả ngắn về bài test này..."
            className="w-full rounded-xl border border-gray-200 px-3.5 py-3 text-sm text-[#1A2744] resize-none focus:outline-none focus:border-[#E8303A]" />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Thời gian làm bài</label>
          <div className="grid grid-cols-4 gap-2">
            {TIME_PRESETS.map(p => (
              <label key={p.value} className="cursor-pointer">
                <input type="radio" name="time_limit_sec" value={p.value} defaultChecked={p.value === 5400} className="sr-only peer" />
                <div className="text-center py-2 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-500 peer-checked:border-[#E8303A] peer-checked:bg-red-50 peer-checked:text-[#E8303A] transition-all cursor-pointer">
                  {p.label}
                </div>
              </label>
            ))}
          </div>
        </div>

        <Button type="submit" disabled={pending}
          className="w-full h-11 bg-[#E8303A] hover:bg-[#C0222B] text-white font-bold rounded-xl border-0">
          {pending ? 'Đang tạo...' : 'Tạo & thêm câu hỏi →'}
        </Button>
      </form>
    </div>
  )
}
