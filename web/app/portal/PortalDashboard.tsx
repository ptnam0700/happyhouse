'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Clock, CheckCircle, BookOpen, LogOut, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  student: { id: string; full_name: string }
  classes: { id: string; name: string; schedule: string | null; teacher: string | null }[]
  tests: {
    test_id: string; name: string; description: string | null
    time_limit_sec: number; due_date: string | null; done: boolean
  }[]
  results: {
    test_id: string; total_correct: number; total_questions: number; submitted_at: string
  }[]
}

function fmt(sec: number) { return `${Math.round(sec / 60)} phút` }
function pct(c: number, t: number) { return t > 0 ? Math.round(c / t * 100) : 0 }

export function PortalDashboard({ student, classes, tests, results }: Props) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/portal/login')
    router.refresh()
  }

  const pending  = tests.filter(t => !t.done)
  const completed = tests.filter(t => t.done)

  return (
    <div className="min-h-screen bg-[#F7F6F2]">
      {/* Header */}
      <header className="bg-[#1A2744] px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Image src="/happy_house_sun.png" alt="logo" width={32} height={32} className="object-contain" />
          <span className="text-white font-bold text-base">HappyHouse</span>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors">
          <LogOut size={15} /> Đăng xuất
        </button>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Welcome */}
        <div className="bg-[#1A2744] rounded-2xl p-5 text-white">
          <p className="text-white/60 text-sm mb-0.5">Xin chào,</p>
          <h1 className="text-xl font-bold mb-3">{student.full_name}</h1>
          {classes.length > 0 && (
            <div className="space-y-1.5">
              {classes.map(c => (
                <div key={c.id} className="flex flex-wrap gap-3 text-sm text-white/80">
                  <span className="flex items-center gap-1.5"><BookOpen size={14} /> {c.name}</span>
                  {c.schedule && <span className="flex items-center gap-1.5"><Clock size={14} /> {c.schedule}</span>}
                  {c.teacher  && <span className="flex items-center gap-1.5">👨‍🏫 {c.teacher}</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending tests */}
        {pending.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-[#1A2744] mb-3 flex items-center gap-2">
              <span className="w-5 h-5 bg-[#E8303A] text-white rounded-full text-xs flex items-center justify-center font-bold">{pending.length}</span>
              Bài test cần làm
            </h2>
            <div className="space-y-3">
              {pending.map(t => (
                <div key={t.test_id} className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(26,39,68,0.08)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[#1A2744]">{t.name}</h3>
                      {t.description && <p className="text-sm text-gray-400 mt-0.5">{t.description}</p>}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Clock size={11} /> {fmt(t.time_limit_sec)}</span>
                        {t.due_date && (
                          <span className="flex items-center gap-1"><Calendar size={11} />
                            Hạn: {new Date(t.due_date + 'T00:00:00').toLocaleDateString('vi-VN')}
                          </span>
                        )}
                      </div>
                    </div>
                    <Link href={`/portal/test/${t.test_id}`}
                      className="shrink-0 bg-[#E8303A] hover:bg-[#C0222B] text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors">
                      Làm bài →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-[#1A2744] mb-3">Kết quả của tôi</h2>
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(26,39,68,0.08)] overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/80 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Bài test</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Điểm</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden sm:table-cell">Ngày</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {results.map((r, i) => {
                    const p = pct(r.total_correct, r.total_questions)
                    const testInfo = tests.find(t => t.test_id === r.test_id)
                    return (
                      <tr key={i} className="hover:bg-gray-50/50">
                        <td className="px-5 py-3 font-medium text-[#1A2744]">
                          {testInfo?.name ?? 'Bài test'}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#1A2744] tabular-nums">{r.total_correct}/{r.total_questions}</span>
                            <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full',
                              p >= 70 ? 'bg-emerald-100 text-emerald-700' :
                              p >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600')}>
                              {p}%
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-xs text-gray-400 hidden sm:table-cell">
                          {new Date(r.submitted_at).toLocaleDateString('vi-VN')}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tests.length === 0 && results.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <BookOpen size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Chưa có bài test nào được giao.</p>
          </div>
        )}
      </div>
    </div>
  )
}
