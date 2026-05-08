import { createServiceClient } from '@/lib/supabase/service'
import { NewTestClient } from '@/components/admin/NewTestClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Tạo bài kiểm tra' }

export default async function NewTestPage() {
  const db = createServiceClient()
  const { data: allQ } = await db
    .from('questions')
    .select('id, section, type, level, question_text, passage_id, passages(id, title, type)')
    .eq('active', true)
    .order('section').order('created_at', { ascending: false })

  const allQuestions = (allQ ?? []).map((q: any) => {
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
  })

  return <NewTestClient allQuestions={allQuestions} />
}
