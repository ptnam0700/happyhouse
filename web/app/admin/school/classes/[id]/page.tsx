import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import { ClassDetailClient } from './ClassDetailClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Chi tiết lớp' }

export default async function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = createServiceClient()

  const [{ data: cls }, { data: enrollments }, { data: classTests }, { data: allTests }] = await Promise.all([
    db.from('classes').select('*').eq('id', id).single(),
    db.from('student_classes')
      .select('enrolled_at, status, school_students(id, full_name, phone, status)')
      .eq('class_id', id).order('enrolled_at'),
    db.from('class_tests').select('test_id, due_date, tests(id, name)').eq('class_id', id).eq('active', true),
    db.from('tests').select('id, name').eq('published', true).order('name'),
  ])

  if (!cls) notFound()

  const students = (enrollments ?? []).map((e: any) => {
    const s = Array.isArray(e.school_students) ? e.school_students[0] : e.school_students
    return { id: s?.id, full_name: s?.full_name, phone: s?.phone ?? null, status: s?.status ?? 'active', enrollment_date: e.enrolled_at }
  }).filter((s: any) => s.id)

  const assignedTests = (classTests ?? []).map((r: any) => {
    const t = Array.isArray(r.tests) ? r.tests[0] : r.tests
    return { test_id: r.test_id, test_name: t?.name ?? 'Unknown', due_date: r.due_date }
  })

  // Homework completion: sessions for enrolled students × assigned tests
  const studentIds = students.map((s: any) => s.id)
  const testIds    = assignedTests.map(t => t.test_id)

  const { data: homeworkSessions } = studentIds.length && testIds.length
    ? await db.from('test_sessions')
        .select('test_id, school_student_id, total_correct, total_questions, submitted_at, band_score')
        .in('test_id', testIds)
        .in('school_student_id', studentIds)
    : { data: [] }

  const { data: available } = await db.from('school_students')
    .select('id, full_name, phone').in('status', ['active', 'paused']).order('full_name')

  return (
    <ClassDetailClient
      cls={cls as any}
      students={students as any}
      assignedTests={assignedTests}
      availableTests={allTests ?? []}
      availableStudents={(available ?? []).map((s: any) => ({ id: s.id, full_name: s.full_name, phone: s.phone ?? null }))}
      homeworkSessions={(homeworkSessions ?? []) as any}
    />
  )
}
