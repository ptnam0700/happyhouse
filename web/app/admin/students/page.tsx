import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/service'
import { StudentsClient } from './StudentsClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Học viên' }

export default async function StudentsPage() {
  const db = createServiceClient()
  const { data: students } = await db
    .from('students')
    .select('id, full_name, phone, email, test_count, latest_band, last_test_at, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="p-4 sm:p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-[#1A2744]">Học viên</h1>
      </div>
      <StudentsClient students={students ?? []} />
    </div>
  )
}
