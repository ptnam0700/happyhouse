import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import { ClassDetailClient } from './ClassDetailClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Chi tiết lớp' }

export default async function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = createServiceClient()

  const [{ data: cls }, { data: students }, { data: classTests }, { data: allTests }, { data: allStudents }] = await Promise.all([
    db.from('classes').select('*').eq('id', id).single(),
    db.from('school_students')
      .select('id, full_name, phone, status, enrollment_date')
      .eq('class_id', id).order('full_name'),
    db.from('class_tests')
      .select('test_id, due_date, tests(name)')
      .eq('class_id', id).eq('active', true),
    db.from('tests').select('id, name').eq('published', true).order('name'),
    // All students not in this class (for the picker)
    db.from('school_students')
      .select('id, full_name, phone, class_id')
      .neq('class_id', id)
      .in('status', ['active', 'paused'])
      .order('full_name'),
  ])

  if (!cls) notFound()

  const assignedTests = (classTests ?? []).map((r: any) => ({
    test_id:   r.test_id,
    test_name: Array.isArray(r.tests) ? r.tests[0]?.name : r.tests?.name ?? 'Unknown',
    due_date:  r.due_date,
  }))

  // Also include students with no class at all (neq excludes nulls in Supabase)
  const { data: unassigned } = await db
    .from('school_students')
    .select('id, full_name, phone, class_id')
    .is('class_id', null)
    .in('status', ['active', 'paused'])
    .order('full_name')

  const availableStudents = [...(unassigned ?? []), ...(allStudents ?? [])]

  return (
    <ClassDetailClient
      cls={cls as any}
      students={students ?? []}
      assignedTests={assignedTests}
      availableTests={allTests ?? []}
      availableStudents={availableStudents}
    />
  )
}
