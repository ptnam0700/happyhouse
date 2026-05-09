import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { sortQuestionsForDisplay } from '@/lib/test-utils'
import { PortalTestClient } from './PortalTestClient'
import type { Question } from '@/types'

export default async function PortalTestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: testId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/portal/login')

  const db = createServiceClient()

  // Get student
  const { data: student } = await db
    .from('school_students')
    .select('id, full_name, phone, class_id')
    .eq('auth_user_id', user.id)
    .single()

  if (!student) redirect('/portal')

  // Verify this test is assigned to the student's class
  if (student.class_id) {
    const { data: ct } = await db
      .from('class_tests')
      .select('test_id')
      .eq('class_id', student.class_id)
      .eq('test_id', testId)
      .single()
    if (!ct) notFound()
  }

  // Fetch test + questions
  const [{ data: test }, { data: tq }] = await Promise.all([
    db.from('tests').select('id, name, description, time_limit_sec').eq('id', testId).single(),
    db.from('test_questions')
      .select(`order_index, questions (
        id, section, type, level, question_text, passage_id, audio_url,
        option_a, option_b, option_c, option_d,
        passages ( title, content, audio_url )
      )`)
      .eq('test_id', testId)
      .order('order_index'),
  ])

  if (!test) notFound()

  const questions: Question[] = (tq ?? [])
    .map((row: any) => {
      const q = Array.isArray(row.questions) ? row.questions[0] : row.questions
      if (!q) return null
      const p = Array.isArray(q.passages) ? q.passages[0] : q.passages
      return {
        id: q.id, section: q.section, type: q.type, level: q.level ?? 'B1',
        question: q.question_text, passageId: q.passage_id ?? null,
        passageTitle: p?.title ?? null, passageContent: p?.content ?? null,
        passageAudio: p?.audio_url ?? null, audio: q.audio_url ?? null,
        options: [q.option_a, q.option_b, q.option_c, q.option_d].filter(Boolean),
      } satisfies Question
    })
    .filter(Boolean) as Question[]

  return (
    <PortalTestClient
      testId={testId}
      testName={test.name}
      testDesc={test.description}
      timeLimitSec={test.time_limit_sec}
      questions={sortQuestionsForDisplay(questions)}
      studentId={student.id}
      studentName={student.full_name}
      studentPhone={student.phone ?? ''}
    />
  )
}
