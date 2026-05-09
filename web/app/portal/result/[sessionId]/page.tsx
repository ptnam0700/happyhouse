import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { PortalResultClient } from './PortalResultClient'
import { sortQuestionsForDisplay } from '@/lib/test-utils'
import type { Question, TestResult, QuestionResult, Answers } from '@/types'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Kết quả bài thi' }

export default async function PortalResultPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/portal/login')

  const db = createServiceClient()

  // Get the student to verify ownership
  const { data: student } = await db
    .from('school_students').select('id, full_name, phone')
    .eq('auth_user_id', user.id).single()
  if (!student) redirect('/portal/login')

  // Fetch session — only allow viewing own sessions
  const { data: session } = await db
    .from('test_sessions')
    .select('id, test_id, total_correct, total_questions, band_score, section_scores, answers, submitted_at, school_student_id')
    .eq('id', sessionId)
    .single()

  if (!session) notFound()
  // Security: only allow viewing own sessions
  if (session.school_student_id !== student.id) notFound()

  // If no test_id (anonymous entry test), show basic result without wrong-answer review
  if (!session.test_id) {
    const sectionScores = (session.section_scores ?? {}) as Record<string, { correct: number; total: number }>
    const result: TestResult = {
      sections:        sectionScores,
      totalCorrect:    session.total_correct ?? 0,
      totalQ:          session.total_questions ?? 0,
      questionResults: {},
    }
    return (
      <PortalResultClient
        studentName={student.full_name}
        studentPhone={student.phone ?? ''}
        result={result}
        questions={[]}
        answers={{}}
        testName="Kết quả bài thi"
        submittedAt={session.submitted_at}
      />
    )
  }

  // Fetch test questions WITH correct answers (for wrong-answer review)
  const { data: tq } = await db
    .from('test_questions')
    .select(`order_index, questions (
      id, section, type, level, question_text, passage_id, audio_url,
      option_a, option_b, option_c, option_d, correct_answer, fill_answer,
      passages ( title, content, audio_url )
    )`)
    .eq('test_id', session.test_id)
    .order('order_index')

  const { data: test } = await db.from('tests').select('name').eq('id', session.test_id).single()

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
        // attach correct answers for review (never sent to browser during the test)
        _correct_answer: q.correct_answer,
        _fill_answer:    q.fill_answer,
      } satisfies Question & { _correct_answer?: string; _fill_answer?: string }
    })
    .filter(Boolean) as any[]

  // Reconstruct question_results from stored answers + correct answers
  const storedAnswers = (session.answers ?? {}) as Answers
  const questionResults: Record<string, QuestionResult> = {}

  questions.forEach((q: any) => {
    const studentAnswer = storedAnswers[q.id]
    let isCorrect = false
    if (q.type === 'fill_blank') {
      isCorrect = !!studentAnswer && !!q._fill_answer &&
        studentAnswer.trim().toLowerCase() === q._fill_answer.trim().toLowerCase()
    } else {
      isCorrect = !!studentAnswer && !!q._correct_answer &&
        studentAnswer.toUpperCase() === q._correct_answer
    }
    questionResults[q.id] = {
      is_correct:     isCorrect,
      correct_answer: q._correct_answer ?? null,
      fill_answer:    q._fill_answer ?? null,
    }
  })

  const sectionScores = (session.section_scores ?? {}) as Record<string, { correct: number; total: number }>
  const result: TestResult = {
    sections:        sectionScores,
    totalCorrect:    session.total_correct ?? 0,
    totalQ:          session.total_questions ?? 0,
    questionResults,
  }

  // Strip internal fields before passing to client
  const cleanQuestions: Question[] = questions.map(({ _correct_answer, _fill_answer, ...q }: any) => q)

  return (
    <PortalResultClient
      studentName={student.full_name}
      studentPhone={student.phone ?? ''}
      result={result}
      questions={sortQuestionsForDisplay(cleanQuestions)}
      answers={storedAnswers}
      testName={test?.name ?? 'Kết quả bài thi'}
      submittedAt={session.submitted_at}
    />
  )
}
