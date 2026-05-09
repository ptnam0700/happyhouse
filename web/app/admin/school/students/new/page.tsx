import { Suspense } from 'react'
import { createServiceClient } from '@/lib/supabase/service'
import { NewStudentForm } from './NewStudentForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Thêm học viên' }

export default async function NewStudentPage() {
  const db = createServiceClient()
  const { data: classes } = await db.from('classes').select('id, name').in('status', ['upcoming','active']).order('name')
  return <Suspense><NewStudentForm classes={classes ?? []} /></Suspense>
}
