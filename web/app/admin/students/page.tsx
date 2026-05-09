import { createServiceClient } from '@/lib/supabase/service'
import { StudentsClient } from './StudentsClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Học viên' }

export default async function StudentsPage() {
  const db = createServiceClient()
  const { data } = await db
    .from('students')
    .select('id, full_name, phone, email, test_count, latest_band, last_test_at')
    .order('created_at', { ascending: false })
  return <StudentsClient students={data ?? []} />
}
