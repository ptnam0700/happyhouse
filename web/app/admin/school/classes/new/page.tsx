'use client'

import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { createClass } from '../../actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const LEVELS = ['A1','A2','B1','B2','C1','C2','Starters','Movers','Flyers']

export default function NewClassPage() {
  const [, action, pending] = useActionState(createClass, undefined)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-gray-100 bg-white flex items-center gap-3">
        <Link href="/admin/school/classes" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#1A2744] transition-colors">
          <ChevronLeft size={16} /> Lớp học
        </Link>
        <span className="text-base font-bold text-[#1A2744]">Tạo lớp mới</span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4">
        <form action={action} className="max-w-xl space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(26,39,68,0.08)] space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-gray-500">Tên lớp *</label>
                <Input name="name" required placeholder="VD: IELTS Foundation A" className="h-10 border-gray-200 rounded-xl focus-visible:border-[#E8303A] focus-visible:ring-0" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Cấp độ</label>
                <select name="level" className="w-full h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-[#1A2744] focus:outline-none focus:border-[#E8303A]">
                  <option value="">— Chọn cấp độ —</option>
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Trạng thái</label>
                <select name="status" defaultValue="upcoming" className="w-full h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-[#1A2744] focus:outline-none focus:border-[#E8303A]">
                  <option value="upcoming">Sắp khai giảng</option>
                  <option value="active">Đang học</option>
                  <option value="completed">Đã kết thúc</option>
                  <option value="cancelled">Đã huỷ</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Giáo viên</label>
                <Input name="teacher" placeholder="Tên giáo viên" className="h-10 border-gray-200 rounded-xl focus-visible:border-[#E8303A] focus-visible:ring-0" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Phòng học</label>
                <Input name="room" placeholder="VD: Phòng 201" className="h-10 border-gray-200 rounded-xl focus-visible:border-[#E8303A] focus-visible:ring-0" />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-gray-500">Lịch học</label>
                <Input name="schedule" placeholder="VD: T2-T4-T6 18:00–20:00" className="h-10 border-gray-200 rounded-xl focus-visible:border-[#E8303A] focus-visible:ring-0" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Ngày khai giảng</label>
                <Input name="start_date" type="date" className="h-10 border-gray-200 rounded-xl focus-visible:border-[#E8303A] focus-visible:ring-0" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Ngày kết thúc</label>
                <Input name="end_date" type="date" className="h-10 border-gray-200 rounded-xl focus-visible:border-[#E8303A] focus-visible:ring-0" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Sĩ số tối đa</label>
                <Input name="max_students" type="number" defaultValue="15" min="1" max="50" className="h-10 border-gray-200 rounded-xl focus-visible:border-[#E8303A] focus-visible:ring-0" />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-gray-500">Ghi chú</label>
                <textarea name="notes" rows={3} placeholder="Ghi chú thêm..." className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-[#1A2744] resize-none focus:outline-none focus:border-[#E8303A]" />
              </div>
            </div>
          </div>
          <Button type="submit" disabled={pending} className="w-full h-11 bg-[#E8303A] hover:bg-[#C0222B] text-white font-bold rounded-xl border-0">
            {pending ? 'Đang tạo...' : 'Tạo lớp →'}
          </Button>
        </form>
      </div>
    </div>
  )
}
