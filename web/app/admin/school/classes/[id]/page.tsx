import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import { ClassDetailClient } from './ClassDetailClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Chi tiết lớp' }

export default async function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = createServiceClient()

  const [{ data: cls }, { data: students }, { data: classTests }, { data: allTests }] = await Promise.all([
    db.from('classes').select('*').eq('id', id).single(),
    db.from('school_students').select('id, full_name, phone, status, enrollment_date').eq('class_id', id).order('full_name'),
    db.from('class_tests').select('test_id, due_date, tests(name)').eq('class_id', id).eq('active', true),
    db.from('tests').select('id, name').eq('published', true).order('name'),
  ])

  if (!cls) notFound()

  const assignedTests = (classTests ?? []).map((r: any) => ({
    test_id:   r.test_id,
    test_name: Array.isArray(r.tests) ? r.tests[0]?.name : r.tests?.name ?? 'Unknown',
    due_date:  r.due_date,
  }))

  return (
    <ClassDetailClient
      cls={cls as any}
      students={students ?? []}
      assignedTests={assignedTests}
      availableTests={allTests ?? []}
    />
  )
}
