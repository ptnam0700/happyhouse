import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import { StudentDetailClient } from './StudentDetailClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Chi tiết học viên' }

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = createServiceClient()

  const [{ data: student }, { data: attendance }, { data: allClasses }, { data: enrollments }] = await Promise.all([
    db.from('school_students').select('*').eq('id', id).single(),
    db.from('attendance')
      .select('session_date, status, notes, classes(name)')
      .eq('student_id', id)
      .order('session_date', { ascending: false })
      .limit(60),
    db.from('classes').select('id, name').in('status', ['upcoming', 'active']).order('name'),
    // Classes this student is enrolled in
    db.from('student_classes')
      .select('class_id, enrolled_at, status, classes(id, name)')
      .eq('student_id', id),
  ])

  if (!student) notFound()

  const studentClasses = (enrollments ?? []).map((e: any) => {
    const cls = Array.isArray(e.classes) ? e.classes[0] : e.classes
    return { class_id: e.class_id, class_name: cls?.name ?? null, enrolled_at: e.enrolled_at, status: e.status }
  })

  return (
    <StudentDetailClient
      student={student as any}
      studentClasses={studentClasses}
      attendance={(attendance ?? []).map((a: any) => ({
        session_date: a.session_date, status: a.status, notes: a.notes,
        class_name: Array.isArray(a.classes) ? a.classes[0]?.name : a.classes?.name ?? null,
      }))}
      allClasses={allClasses ?? []}
    />
  )
}
