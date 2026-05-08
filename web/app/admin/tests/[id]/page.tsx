import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import { TestEditClient } from '@/components/admin/TestEditClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Chỉnh sửa bài test' }

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://happyhouseielts.com'

export default async function TestEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = createServiceClient()

  const [{ data: test }, { data: tq }, { data: allQ }] = await Promise.all([
    db.from('tests').select('id, name, description, time_limit_sec, published').eq('id', id).single(),
    db.from('test_questions')
      .select('question_id, order_index, questions(id, section, type, level, question_text)')
      .eq('test_id', id)
      .order('order_index'),
    db.from('questions')
      .select('id, section, type, level, question_text, passage_id, passages(id, title, type)')
      .eq('active', true)
      .order('section').order('created_at', { ascending: false }),
  ])

  if (!test) notFound()

  const testQuestions = (tq ?? []).map(r => {
    const q = Array.isArray(r.questions) ? r.questions[0] : r.questions
    return {
      question_id:   r.question_id,
      order_index:   r.order_index,
      question_text: q?.question_text ?? '',
      section:       q?.section ?? '',
      type:          q?.type ?? 'multiple_choice',
      level:         q?.level ?? null,
    }
  })

  return (
    <TestEditClient
      test={test as any}
      testQuestions={testQuestions}
      allQuestions={(allQ ?? []).map((q: any) => {
      const p = Array.isArray(q.passages) ? q.passages[0] : q.passages
      return {
        id:            q.id,
        section:       q.section,
        type:          q.type,
        level:         q.level,
        question_text: q.question_text,
        passage_id:    q.passage_id ?? null,
        passage_title: p?.title ?? null,
        passage_type:  p?.type ?? null,
      }
    })}
      siteUrl={SITE}
    />
  )
}
