import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/service'
import { SchoolStudentsClient } from './SchoolStudentsClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Học viên' }

export default async function SchoolStudentsPage() {
  const db = createServiceClient()
  const [{ data: students }, { data: classes }] = await Promise.all([
    db.from('school_students').select('id, full_name, phone, email, date_of_birth, status, enrollment_date, class_id, classes(name)').order('full_name'),
    db.from('classes').select('id, name').eq('status', 'active').order('name'),
  ])

  const data = (students ?? []).map((s: any) => ({
    ...s,
    class_name: Array.isArray(s.classes) ? (s.classes[0]?.name ?? null) : s.classes?.name ?? null,
  }))

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-gray-100 bg-white flex items-center gap-2">
        <span className="text-base font-bold text-[#1A2744] mr-auto">Học viên</span>
        <Link href="/admin/school/students/new"
          className="flex items-center gap-1.5 h-8 px-3 rounded-xl bg-[#E8303A] hover:bg-[#C0222B] text-white text-xs font-semibold transition-colors">
          <Plus size={13} /> Thêm học viên
        </Link>
      </div>
      <SchoolStudentsClient students={data} classes={classes ?? []} />
    </div>
  )
}
