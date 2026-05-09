import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import { ClassDetailClient } from './ClassDetailClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Chi tiết lớp' }

export default async function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = createServiceClient()

  const [{ data: cls }, { data: students }] = await Promise.all([
    db.from('classes').select('*').eq('id', id).single(),
    db.from('school_students')
      .select('id, full_name, phone, status, enrollment_date')
      .eq('class_id', id)
      .order('full_name'),
  ])

  if (!cls) notFound()

  return <ClassDetailClient cls={cls as any} students={students ?? []} />
}
