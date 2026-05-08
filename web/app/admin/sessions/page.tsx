import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/service'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Bài thi' }

const BAND_COLOR: Record<string, string> = {
  '6.5 – 7.0': 'bg-emerald-100 text-emerald-700',
  '5.5 – 6.0': 'bg-blue-100 text-blue-700',
  '4.5 – 5.0': 'bg-yellow-100 text-yellow-700',
  '3.5 – 4.0': 'bg-orange-100 text-orange-700',
  'Below 3.5': 'bg-red-100 text-red-700',
}

function formatDuration(sec: number | null) {
  if (!sec) return '—'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default async function SessionsPage() {
  const db = createServiceClient()
  const { data: sessions } = await db
    .from('test_sessions')
    .select('id, test_type, band_score, total_correct, total_questions, duration_sec, submitted_at, students(id, full_name, phone)')
    .order('submitted_at', { ascending: false })

  return (
    <div className="p-4 sm:p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-[#1A2744]">Bài thi</h1>
        <span className="text-sm text-gray-400">{sessions?.length ?? 0} bài thi</span>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(26,39,68,0.08)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Học viên</th>
                <th className="text-left px-3 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Loại</th>
                <th className="text-left px-3 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Band</th>
                <th className="text-left px-3 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Điểm</th>
                <th className="text-left px-3 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden sm:table-cell">Thời gian</th>
                <th className="text-left px-3 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Ngày</th>
              </tr>
            </thead>
            <tbody>
              {sessions?.map(s => {
                const student = Array.isArray(s.students) ? s.students[0] : s.students
                const pct = s.total_questions ? Math.round((s.total_correct! / s.total_questions) * 100) : 0
                return (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      {student ? (
                        <Link href={`/admin/students/${(student as any).id}`} className="hover:text-[#E8303A] transition-colors">
                          <div className="font-semibold text-[#1A2744]">{(student as any).full_name}</div>
                          <div className="text-xs text-gray-400">{(student as any).phone}</div>
                        </Link>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-3 py-3.5">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.test_type === 'full' ? 'bg-[#1A2744]/10 text-[#1A2744]' : 'bg-gray-100 text-gray-500'}`}>
                        {s.test_type}
                      </span>
                    </td>
                    <td className="px-3 py-3.5">
                      {s.band_score ? (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${BAND_COLOR[s.band_score] ?? 'bg-gray-100 text-gray-500'}`}>
                          {s.band_score}
                        </span>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-3 py-3.5 tabular-nums">
                      <span className="font-semibold text-[#1A2744]">{s.total_correct}</span>
                      <span className="text-gray-400">/{s.total_questions}</span>
                      <span className="text-gray-400 text-xs ml-1">({pct}%)</span>
                    </td>
                    <td className="px-3 py-3.5 text-gray-400 hidden sm:table-cell tabular-nums">
                      {formatDuration(s.duration_sec)}
                    </td>
                    <td className="px-3 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(s.submitted_at!).toLocaleDateString('vi-VN')}
                    </td>
                  </tr>
                )
              })}
              {!sessions?.length && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400">Chưa có dữ liệu</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
