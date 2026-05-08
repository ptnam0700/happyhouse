import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import { EditQuestionClient } from './EditQuestionClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Chỉnh sửa câu hỏi' }

export default async function EditQuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = createServiceClient()
  const { data } = await db
    .from('questions')
    .select('id, section, type, level, question_text, option_a, option_b, option_c, option_d, correct_answer, fill_answer')
    .eq('id', id)
    .single()

  if (!data) notFound()

  return (
    <EditQuestionClient
      id={id}
      initial={{
        id:             data.id,
        section:        data.section,
        type:           data.type,
        level:          data.level,
        question_text:  data.question_text,
        option_a:       data.option_a ?? '',
        option_b:       data.option_b ?? '',
        option_c:       data.option_c ?? '',
        option_d:       data.option_d ?? '',
        correct_answer: data.correct_answer ?? 'A',
        fill_answer:    data.fill_answer ?? '',
      }}
    />
  )
}
