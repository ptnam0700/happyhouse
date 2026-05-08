import Link from 'next/link'
import { Plus, BookOpen, Headphones } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/service'
import { PassagesClient } from './PassagesClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Bài đọc / Nghe' }

export default async function PassagesPage() {
  const db = createServiceClient()
  const [{ data: passages }, { data: qCounts }] = await Promise.all([
    db.from('passages').select('id, title, type, level, active, created_at').order('type').order('created_at', { ascending: false }),
    db.from('questions').select('passage_id').not('passage_id', 'is', null),
  ])

  const countMap: Record<string, number> = {}
  qCounts?.forEach(q => { if (q.passage_id) countMap[q.passage_id] = (countMap[q.passage_id] ?? 0) + 1 })

  const data = (passages ?? []).map(p => ({ ...p, qCount: countMap[p.id] ?? 0 }))

  return (
    <div className="p-4 sm:p-8 max-w-4xl">
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <h1 className="text-xl sm:text-2xl font-bold text-[#1A2744]">Bài đọc / Nghe</h1>
        <div className="flex gap-2">
          <Link href="/admin/passages/new?type=reading"
            className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors">
            <Plus size={15} /><BookOpen size={14} /> Bài đọc
          </Link>
          <Link href="/admin/passages/new?type=listening"
            className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors">
            <Plus size={15} /><Headphones size={14} /> Bài nghe
          </Link>
        </div>
      </div>
      <PassagesClient passages={data} />
    </div>
  )
}
