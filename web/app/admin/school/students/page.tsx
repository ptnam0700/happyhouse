import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/service'
import { SchoolStudentsClient } from './SchoolStudentsClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Học viên' }

export default async function SchoolStudentsPage() {
  const db = createServiceClient()
  const [{ data: students }, { data: classes }] = await Promise.all([
    // Join through student_classes to get all enrolled classes per student
    db.from('school_students')
      .select('id, full_name, phone, email, status, enrollment_date, student_classes(class_id, status, classes(id, name))')
      .order('full_name'),
    db.from('classes').select('id, name').eq('status', 'active').order('name'),
  ])

  const data = (students ?? []).map((s: any) => ({
    id:              s.id,
    full_name:       s.full_name,
    phone:           s.phone,
    email:           s.email,
    status:          s.status,
    enrollment_date: s.enrollment_date,
    classes: (s.student_classes ?? [])
      .filter((sc: any) => sc.status === 'active')
      .map((sc: any) => {
        const cls = Array.isArray(sc.classes) ? sc.classes[0] : sc.classes
        return { class_id: sc.class_id, class_name: cls?.name ?? null }
      }),
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
