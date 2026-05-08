import { createServiceClient } from '@/lib/supabase/service'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Bài đọc / Nghe' }

export default async function PassagesPage() {
  const db = createServiceClient()

  const [{ data: passages }, { data: questionCounts }] = await Promise.all([
    db.from('passages')
      .select('id, title, type, level, active, created_at')
      .order('type')
      .order('created_at', { ascending: false }),
    db.from('questions')
      .select('passage_id')
      .not('passage_id', 'is', null),
  ])

  // Count questions per passage
  const countMap: Record<string, number> = {}
  questionCounts?.forEach(q => {
    if (q.passage_id) countMap[q.passage_id] = (countMap[q.passage_id] ?? 0) + 1
  })

  return (
    <div className="p-4 sm:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-[#1A2744]">Bài đọc / Nghe</h1>
        <span className="text-sm text-gray-400">{passages?.length ?? 0} bài</span>
      </div>

      <div className="space-y-3">
        {passages?.map(p => (
          <div key={p.id} className="bg-white rounded-2xl px-5 py-4 shadow-[0_2px_8px_rgba(26,39,68,0.08)] flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                  p.type === 'reading' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {p.type === 'reading' ? 'Đọc' : 'Nghe'}
                </span>
                <span className="text-xs text-gray-400 font-medium">{p.level}</span>
                <span className="font-semibold text-[#1A2744] truncate">{p.title ?? 'Không có tiêu đề'}</span>
              </div>
              <div className="mt-1 text-xs text-gray-400">
                {countMap[p.id] ?? 0} câu hỏi · Tạo {new Date(p.created_at!).toLocaleDateString('vi-VN')}
              </div>
            </div>
            <div className="shrink-0">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                p.active ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {p.active ? 'Active' : 'Ẩn'}
              </span>
            </div>
          </div>
        ))}
        {!passages?.length && (
          <p className="text-gray-400 text-sm text-center py-12">Chưa có bài đọc hoặc nghe nào</p>
        )}
      </div>
    </div>
  )
}
