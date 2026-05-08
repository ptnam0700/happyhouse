import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import { CuratedTestClient } from './CuratedTestClient'
import type { Metadata } from 'next'
import type { Question } from '@/types'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const db = createServiceClient()
  const { data } = await db.from('tests').select('name, description').eq('id', id).single()
  return {
    title: data?.name ?? 'Bài kiểm tra IELTS',
    description: data?.description ?? 'Kiểm tra trình độ IELTS miễn phí tại HappyHouse',
    robots: { index: false, follow: false },
  }
}

export default async function CuratedTestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = createServiceClient()

  const { data: test } = await db
    .from('tests')
    .select('id, name, description, time_limit_sec, published, active')
    .eq('id', id)
    .single()

  if (!test || !test.published || !test.active) notFound()

  const { data: tq } = await db
    .from('test_questions')
    .select(`
      order_index,
      questions (
        id, section, type, level, question_text,
        passage_id, audio_url,
        option_a, option_b, option_c, option_d,
        passages ( title, content, audio_url )
      )
    `)
    .eq('test_id', id)
    .order('order_index')

  const questions: Question[] = (tq ?? [])
    .map(row => {
      const q = Array.isArray(row.questions) ? row.questions[0] : row.questions
      if (!q) return null
      const p = Array.isArray(q.passages) ? q.passages[0] : q.passages
      return {
        id:             q.id,
        section:        q.section,
        type:           q.type,
        level:          q.level ?? 'B1',
        question:       q.question_text,
        passageId:      q.passage_id ?? null,
        passageTitle:   p?.title ?? null,
        passageContent: p?.content ?? null,
        passageAudio:   p?.audio_url ?? null,
        audio:          q.audio_url ?? null,
        options:        [q.option_a, q.option_b, q.option_c, q.option_d].filter(Boolean),
      } satisfies Question
    })
    .filter(Boolean) as Question[]

  return (
    <CuratedTestClient
      testId={test.id}
      testName={test.name}
      testDesc={test.description}
      timeLimitSec={test.time_limit_sec}
      questions={questions}
    />
  )
}
