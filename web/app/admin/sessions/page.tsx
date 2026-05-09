import { createServiceClient } from '@/lib/supabase/service'
import { SessionsClient } from './SessionsClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Bài thi' }

export default async function SessionsPage() {
  const db = createServiceClient()
  const { data } = await db
    .from('test_sessions')
    .select('id, test_type, band_score, total_correct, total_questions, duration_sec, submitted_at, students(id, full_name, phone)')
    .order('submitted_at', { ascending: false })

  const sessions = (data ?? []).map(s => ({
    ...s,
    student: Array.isArray(s.students) ? (s.students[0] ?? null) : (s.students ?? null),
  }))
  return <SessionsClient sessions={sessions} />
}
