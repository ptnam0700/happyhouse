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
    <div className="flex flex-col h-full overflow-hidden">
      <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-gray-100 bg-white flex items-center gap-2">
        <span className="text-base font-bold text-[#1A2744] mr-auto">Bài đọc / Nghe</span>
        <Link href="/admin/passages/new?type=reading"
          className="flex items-center gap-1 h-8 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors">
          <Plus size={13} /><BookOpen size={12} /> Bài đọc
        </Link>
        <Link href="/admin/passages/new?type=listening"
          className="flex items-center gap-1 h-8 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold transition-colors">
          <Plus size={13} /><Headphones size={12} /> Bài nghe
        </Link>
      </div>
      <PassagesClient passages={data} />
    </div>
  )
}
