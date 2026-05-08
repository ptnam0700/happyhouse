import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/service'
import { ChevronLeft } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Chi tiết học viên' }

const BAND_COLOR: Record<string, string> = {
  '6.5 – 7.0': 'bg-emerald-100 text-emerald-700',
  '5.5 – 6.0': 'bg-blue-100 text-blue-700',
  '4.5 – 5.0': 'bg-yellow-100 text-yellow-700',
  '3.5 – 4.0': 'bg-orange-100 text-orange-700',
  'Below 3.5': 'bg-red-100 text-red-700',
}

const SECTION_NAMES: Record<string, string> = {
  grammar: 'Ngữ pháp', vocabulary: 'Từ vựng', reading: 'Đọc', listening: 'Nghe',
}

function formatDuration(sec: number | null) {
  if (!sec) return '—'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = createServiceClient()

  const [{ data: student }, { data: sessions }] = await Promise.all([
    db.from('students').select('*').eq('id', id).single(),
    db.from('test_sessions')
      .select('id, test_type, band_score, total_correct, total_questions, duration_sec, submitted_at, section_scores')
      .eq('student_id', id)
      .order('submitted_at', { ascending: false }),
  ])

  if (!student) notFound()

  return (
    <div className="p-4 sm:p-8 max-w-4xl">
      <Link href="/admin/students" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#1A2744] mb-6 transition-colors">
        <ChevronLeft size={16} />
        Danh sách học viên
      </Link>

      {/* Student info */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-[0_2px_8px_rgba(26,39,68,0.08)] mb-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-[#1A2744]">{student.full_name}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-sm text-gray-500">
              <span>{student.phone}</span>
              {student.email && <span>{student.email}</span>}
              <span>Tham gia {new Date(student.created_at!).toLocaleDateString('vi-VN')}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#1A2744]">{student.test_count ?? 0}</div>
              <div className="text-xs text-gray-400">Bài thi</div>
            </div>
            {student.latest_band && (
              <span className={`text-sm font-bold px-3 py-1.5 rounded-xl ${BAND_COLOR[student.latest_band] ?? 'bg-gray-100 text-gray-500'}`}>
                {student.latest_band}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Session history */}
      <h2 className="text-sm font-bold text-[#1A2744] uppercase tracking-wide mb-3">Lịch sử làm bài</h2>
      <div className="space-y-3">
        {sessions?.map(s => {
          const scores = s.section_scores as Record<string, { correct: number; total: number }> | null
          return (
            <div key={s.id} className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(26,39,68,0.08)]">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${s.test_type === 'full' ? 'bg-[#1A2744]/10 text-[#1A2744]' : 'bg-gray-100 text-gray-500'}`}>
                    {s.test_type === 'full' ? 'Full Test' : 'Mini Test'}
                  </span>
                  {s.band_score && (
                    <span className={`text-sm font-bold px-2.5 py-1 rounded-full ${BAND_COLOR[s.band_score] ?? 'bg-gray-100 text-gray-500'}`}>
                      {s.band_score}
                    </span>
                  )}
                  <span className="text-sm text-[#1A2744] font-semibold">
                    {s.total_correct}/{s.total_questions} câu đúng
                  </span>
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(s.submitted_at!).toLocaleString('vi-VN')} · {formatDuration(s.duration_sec)}
                </div>
              </div>
              {scores && Object.keys(scores).length > 0 && (
                <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-gray-100">
                  {Object.entries(scores).map(([section, val]) => {
                    const pct = val.total > 0 ? Math.round((val.correct / val.total) * 100) : 0
                    return (
                      <div key={section} className="text-xs">
                        <span className="text-gray-400">{SECTION_NAMES[section] ?? section}: </span>
                        <span className="font-semibold text-[#1A2744]">{val.correct}/{val.total}</span>
                        <span className="text-gray-400"> ({pct}%)</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
        {!sessions?.length && (
          <p className="text-gray-400 text-sm text-center py-8">Chưa có bài thi nào</p>
        )}
      </div>
    </div>
  )
}
