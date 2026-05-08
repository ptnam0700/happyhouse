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
    id:             s.id,
    test_type:      s.test_type,
    band_score:     s.band_score,
    total_correct:  s.total_correct,
    total_questions:s.total_questions,
    duration_sec:   s.duration_sec,
    submitted_at:   s.submitted_at,
    student: Array.isArray(s.students) ? (s.students[0] ?? null) : (s.students ?? null),
  }))

  return (
    <div className="p-4 sm:p-8 max-w-6xl">
      <h1 className="text-xl sm:text-2xl font-bold text-[#1A2744] mb-6">Bài thi</h1>
      <SessionsClient sessions={sessions} />
    </div>
  )
}
