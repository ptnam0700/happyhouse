import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/service'
import { QuestionsClient } from './QuestionsClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Câu hỏi' }

export default async function QuestionsPage() {
  const db = createServiceClient()
  const { data: questions } = await db
    .from('questions')
    .select('id, section, type, level, question_text, active, passage_id')
    .order('section')
    .order('created_at', { ascending: false })

  return (
    <div className="p-4 sm:p-8 max-w-6xl">
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <h1 className="text-xl sm:text-2xl font-bold text-[#1A2744]">Câu hỏi</h1>
        <Link href="/admin/questions/new"
          className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[#E8303A] hover:bg-[#C0222B] text-white text-sm font-semibold transition-colors">
          <Plus size={15} /> Thêm câu hỏi
        </Link>
      </div>

      <QuestionsClient questions={questions ?? []} />
    </div>
  )
}
