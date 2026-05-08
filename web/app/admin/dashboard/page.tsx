import { createServiceClient } from '@/lib/supabase/service'
import { StatCard } from '@/components/admin/StatCard'
import { Users, ClipboardList, BookOpen, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard' }

const BAND_COLOR: Record<string, string> = {
  '6.5 – 7.0': 'bg-emerald-100 text-emerald-700',
  '5.5 – 6.0': 'bg-blue-100 text-blue-700',
  '4.5 – 5.0': 'bg-yellow-100 text-yellow-700',
  '3.5 – 4.0': 'bg-orange-100 text-orange-700',
  'Below 3.5': 'bg-red-100 text-red-700',
}

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default async function DashboardPage() {
  const db = createServiceClient()

  const [
    { count: totalStudents },
    { count: totalSessions },
    { count: weekSessions },
    { count: activeQuestions },
    { data: bandDist },
    { data: recentSessions },
  ] = await Promise.all([
    db.from('students').select('*', { count: 'exact', head: true }),
    db.from('test_sessions').select('*', { count: 'exact', head: true }),
    db.from('test_sessions').select('*', { count: 'exact', head: true })
      .gte('submitted_at', new Date(Date.now() - 7 * 86400 * 1000).toISOString()),
    db.from('questions').select('*', { count: 'exact', head: true }).eq('active', true),
    db.from('test_sessions').select('band_score').order('band_score'),
    db.from('test_sessions')
      .select('id, test_type, band_score, total_correct, total_questions, duration_sec, submitted_at, students(full_name, phone)')
      .order('submitted_at', { ascending: false })
      .limit(10),
  ])

  // Tally band distribution
  const bandMap: Record<string, number> = {}
  bandDist?.forEach(r => {
    if (r.band_score) bandMap[r.band_score] = (bandMap[r.band_score] ?? 0) + 1
  })
  const bandOrder = ['6.5 – 7.0', '5.5 – 6.0', '4.5 – 5.0', '3.5 – 4.0', 'Below 3.5']

  return (
    <div className="p-4 sm:p-8 max-w-6xl">
      <h1 className="text-xl sm:text-2xl font-bold text-[#1A2744] mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <StatCard label="Học viên" value={totalStudents ?? 0} icon={Users} />
        <StatCard label="Bài thi" value={totalSessions ?? 0} icon={ClipboardList} accent />
        <StatCard label="Tuần này" value={weekSessions ?? 0} sub="7 ngày qua" icon={TrendingUp} />
        <StatCard label="Câu hỏi" value={activeQuestions ?? 0} sub="đang active" icon={BookOpen} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Band distribution */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(26,39,68,0.08)]">
          <h2 className="text-sm font-bold text-[#1A2744] uppercase tracking-wide mb-4">Phân bố Band Score</h2>
          <div className="space-y-3">
            {bandOrder.map(band => {
              const count = bandMap[band] ?? 0
              const pct = totalSessions ? Math.round((count / totalSessions) * 100) : 0
              return (
                <div key={band}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-[#1A2744]">{band}</span>
                    <span className="text-gray-400">{count} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#E8303A] rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent sessions */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-[0_2px_8px_rgba(26,39,68,0.08)] overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-[#1A2744] uppercase tracking-wide">Bài thi gần đây</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Học viên</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Loại</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Band</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Điểm</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Ngày</th>
                </tr>
              </thead>
              <tbody>
                {recentSessions?.map(s => {
                  const student = Array.isArray(s.students) ? s.students[0] : s.students
                  return (
                    <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="font-medium text-[#1A2744] truncate max-w-[140px]">{student?.full_name ?? '—'}</div>
                        <div className="text-xs text-gray-400">{student?.phone}</div>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.test_type === 'full' ? 'bg-[#1A2744]/10 text-[#1A2744]' : 'bg-gray-100 text-gray-500'}`}>
                          {s.test_type}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${BAND_COLOR[s.band_score ?? ''] ?? 'bg-gray-100 text-gray-500'}`}>
                          {s.band_score ?? '—'}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-gray-600 tabular-nums">
                        {s.total_correct}/{s.total_questions}
                      </td>
                      <td className="px-3 py-3 text-gray-400 text-xs whitespace-nowrap">
                        {new Date(s.submitted_at!).toLocaleDateString('vi-VN')}
                      </td>
                    </tr>
                  )
                })}
                {!recentSessions?.length && (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400 text-sm">Chưa có dữ liệu</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
