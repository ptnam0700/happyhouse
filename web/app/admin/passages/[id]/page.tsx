import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import { PassageEditClient } from '@/components/admin/PassageEditClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Chỉnh sửa bài' }

export default async function PassageEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = createServiceClient()

  const [{ data: passage }, { data: questions }] = await Promise.all([
    db.from('passages').select('*').eq('id', id).single(),
    db.from('questions')
      .select('id, section, type, level, question_text, option_a, option_b, option_c, option_d, correct_answer, fill_answer, active')
      .eq('passage_id', id)
      .order('created_at'),
  ])

  if (!passage) notFound()

  return <PassageEditClient passage={passage as any} questions={questions ?? []} />
}
