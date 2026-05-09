import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/service'
import { QuestionsClient } from './QuestionsClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Câu hỏi' }

export default async function QuestionsPage() {
  const db = createServiceClient()
  const { data } = await db
    .from('questions')
    .select('id, section, type, level, question_text, active, passage_id')
    .order('section').order('created_at', { ascending: false })
  return <QuestionsClient questions={data ?? []} />
}
