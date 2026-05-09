import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/service'
import { TestsClient } from './TestsClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Bài kiểm tra' }

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://happyhouseielts.com'

export default async function TestsPage() {
  const db = createServiceClient()
  const [{ data: tests }, { data: qCounts }] = await Promise.all([
    db.from('tests').select('id, name, description, time_limit_sec, published, active, created_at').order('created_at', { ascending: false }),
    db.from('test_questions').select('test_id'),
  ])
  const countMap: Record<string, number> = {}
  qCounts?.forEach(r => { countMap[r.test_id] = (countMap[r.test_id] ?? 0) + 1 })
  const data = (tests ?? []).map(t => ({ ...t, qCount: countMap[t.id] ?? 0 }))

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-gray-100 bg-white flex items-center gap-2">
        <span className="text-base font-bold text-[#1A2744] mr-auto">Bài kiểm tra</span>
        <Link href="/admin/tests/new"
          className="flex items-center gap-1.5 h-8 px-3 rounded-xl bg-[#E8303A] hover:bg-[#C0222B] text-white text-xs font-semibold transition-colors">
          <Plus size={13} /> Tạo bài test
        </Link>
      </div>
      <TestsClient tests={data} siteUrl={SITE} />
    </div>
  )
}
