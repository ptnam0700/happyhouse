import { createServiceClient } from '@/lib/supabase/service'
import { SessionsClient } from './SessionsClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Bài thi' }

export default async function SessionsPage() {
  const db = createServiceClient()
  const [{ data }, { data: tests }] = await Promise.all([
    db.from('test_sessions')
      .select('id, test_type, test_id, band_score, total_correct, total_questions, duration_sec, submitted_at, students(id, full_name, phone), tests(id, name)')
      .order('submitted_at', { ascending: false }),
    db.from('tests').select('id, name').order('name'),
  ])

  const sessions = (data ?? []).map((s: any) => ({
    id:              s.id,
    test_type:       s.test_type,
    test_id:         s.test_id ?? null,
    test_name:       (Array.isArray(s.tests) ? s.tests[0]?.name : s.tests?.name) ?? null,
    band_score:      s.band_score,
    total_correct:   s.total_correct,
    total_questions: s.total_questions,
    duration_sec:    s.duration_sec,
    submitted_at:    s.submitted_at,
    student:         Array.isArray(s.students) ? (s.students[0] ?? null) : (s.students ?? null),
  }))

  return <SessionsClient sessions={sessions} allTests={tests ?? []} />
}
