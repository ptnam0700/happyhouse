'use client'

import { useSearchParams } from 'next/navigation'
import { useActionState } from 'react'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { createSchoolStudent } from '../../actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Cls { id: string; name: string }

export function NewStudentForm({ classes }: { classes: Cls[] }) {
  const params = useSearchParams()
  const defaultClass = params.get('class_id') ?? ''
  const [, action, pending] = useActionState(createSchoolStudent, undefined)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-gray-100 bg-white flex items-center gap-3">
        <Link href="/admin/school/students" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#1A2744] transition-colors">
          <ChevronLeft size={16} /> Học viên
        </Link>
        <span className="text-base font-bold text-[#1A2744]">Thêm học viên mới</span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4">
        <form action={action} className="max-w-xl space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(26,39,68,0.08)] space-y-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Thông tin học viên</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-gray-500">Họ và tên *</label>
                <Input name="full_name" required placeholder="Nguyễn Văn A" className="h-10 border-gray-200 rounded-xl focus-visible:border-[#E8303A] focus-visible:ring-0" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Số điện thoại</label>
                <Input name="phone" type="tel" placeholder="0901234567" className="h-10 border-gray-200 rounded-xl focus-visible:border-[#E8303A] focus-visible:ring-0" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Email</label>
                <Input name="email" type="email" placeholder="email@example.com" className="h-10 border-gray-200 rounded-xl focus-visible:border-[#E8303A] focus-visible:ring-0" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Ngày sinh</label>
                <Input name="date_of_birth" type="date" className="h-10 border-gray-200 rounded-xl focus-visible:border-[#E8303A] focus-visible:ring-0" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Ngày nhập học</label>
                <Input name="enrollment_date" type="date" defaultValue={new Date().toISOString().slice(0,10)} className="h-10 border-gray-200 rounded-xl focus-visible:border-[#E8303A] focus-visible:ring-0" />
              </div>
            </div>

            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide pt-2">Phụ huynh (nếu có)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Tên phụ huynh</label>
                <Input name="parent_name" placeholder="Nguyễn Văn B" className="h-10 border-gray-200 rounded-xl focus-visible:border-[#E8303A] focus-visible:ring-0" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">SĐT phụ huynh</label>
                <Input name="parent_phone" type="tel" placeholder="0901234567" className="h-10 border-gray-200 rounded-xl focus-visible:border-[#E8303A] focus-visible:ring-0" />
              </div>
            </div>

            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide pt-2">Xếp lớp</h2>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">Lớp học</label>
              <select name="class_id" defaultValue={defaultClass} className="w-full h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-[#1A2744] focus:outline-none focus:border-[#E8303A]">
                <option value="">— Chưa xếp lớp —</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">Ghi chú</label>
              <textarea name="notes" rows={3} placeholder="Ghi chú thêm..." className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-[#1A2744] resize-none focus:outline-none focus:border-[#E8303A]" />
            </div>
          </div>
          <Button type="submit" disabled={pending} className="w-full h-11 bg-[#E8303A] hover:bg-[#C0222B] text-white font-bold rounded-xl border-0">
            {pending ? 'Đang lưu...' : 'Thêm học viên →'}
          </Button>
        </form>
      </div>
    </div>
  )
}
