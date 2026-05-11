'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Clock, BookOpen, LogOut, Calendar, CheckCircle, RotateCcw, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TestItem {
  test_id: string; name: string; description: string | null
  time_limit_sec: number; due_date: string | null; done: boolean
  latest_session_id: string | null
  latest_total_correct: number | null; latest_total_questions: number | null
  latest_band: string | null; latest_submitted_at: string | null
}
interface ResultItem { id: string; test_id: string; total_correct: number; total_questions: number; submitted_at: string }
interface ClassItem  { id: string; name: string; schedule: string | null; teacher: string | null }

interface Props {
  student:    { id: string; full_name: string }
  classes:    ClassItem[]
  tests:      TestItem[]
  allResults: ResultItem[]
}

function fmt(sec: number) { return `${Math.round(sec / 60)} phút` }
function pct(c: number, t: number) { return t > 0 ? Math.round(c / t * 100) : 0 }

const BAND_COLOR: Record<string, string> = {
  '6.5 – 7.0': 'bg-emerald-100 text-emerald-700', '5.5 – 6.0': 'bg-blue-100 text-blue-700',
  '4.5 – 5.0': 'bg-yellow-100 text-yellow-700',   '3.5 – 4.0': 'bg-orange-100 text-orange-700',
  'Below 3.5': 'bg-red-100 text-red-700',
}

export function PortalDashboard({ student, classes, tests, allResults }: Props) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/portal/login'); router.refresh()
  }

  const pending   = tests.filter(t => !t.done)
  const completed = tests.filter(t => t.done)
  const sortedResults = [...allResults].sort((a, b) =>
    new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
  )

  return (
    <div className="min-h-screen bg-[#F7F6F2]">
      <header className="bg-[#1A2744] px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Image src="/happy_house_sun.png" alt="logo" width={32} height={32} className="object-contain" />
          <span className="text-white font-bold text-base">HappyHouse</span>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors">
          <LogOut size={15} /> Đăng xuất
        </button>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Quick nav */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/portal/vocab" className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-[0_2px_8px_rgba(26,39,68,0.08)] hover:shadow-md transition-all">
            <span className="text-2xl">📚</span>
            <div><div className="font-bold text-[#1A2744] text-sm">Từ vựng</div><div className="text-xs text-gray-400">Bộ từ của tôi</div></div>
          </Link>
          <Link href="/test" className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-[0_2px_8px_rgba(26,39,68,0.08)] hover:shadow-md transition-all">
            <span className="text-2xl">📝</span>
            <div><div className="font-bold text-[#1A2744] text-sm">Kiểm tra</div><div className="text-xs text-gray-400">Thi thử IELTS</div></div>
          </Link>
        </div>

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
                          <span className="flex items-center gap-1 text-orange-500 font-medium">
                            <Calendar size={11} /> Hạn: {new Date(t.due_date + 'T00:00:00').toLocaleDateString('vi-VN')}
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

        {/* Completed tests — with all attempts per test */}
        {completed.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-[#1A2744] mb-3 flex items-center gap-2">
              <CheckCircle size={16} className="text-emerald-500" />
              Đã hoàn thành ({completed.length})
            </h2>
            <div className="space-y-3">
              {completed.map(t => {
                // All attempts for this test, newest first
                const attempts = sortedResults.filter(r => r.test_id === t.test_id)
                const latest = attempts[0]
                const p = latest ? pct(latest.total_correct, latest.total_questions) : 0

                return (
                  <div key={t.test_id} className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(26,39,68,0.08)] overflow-hidden">
                    {/* Main row */}
                    <div className="flex items-start justify-between gap-3 p-5">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                          <h3 className="font-bold text-[#1A2744] truncate">{t.name}</h3>
                          {t.latest_band && (
                            <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', BAND_COLOR[t.latest_band] ?? 'bg-gray-100 text-gray-500')}>
                              {t.latest_band}
                            </span>
                          )}
                          {attempts.length > 1 && (
                            <span className="text-xs text-gray-400">{attempts.length} lần làm</span>
                          )}
                        </div>
                        {latest && (
                          <div className="flex items-center gap-3 mt-2 text-sm">
                            <span className="font-semibold text-[#1A2744]">
                              {latest.total_correct}/{latest.total_questions}
                            </span>
                            <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full',
                              p >= 70 ? 'bg-emerald-100 text-emerald-700' : p >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600')}>
                              {p}%
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(latest.submitted_at).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        {latest && (
                          <Link href={`/portal/result/${latest.id}`}
                            className="flex items-center gap-1.5 text-xs font-semibold text-[#1A2744] bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-xl transition-colors">
                            <Eye size={13} /> Xem kết quả
                          </Link>
                        )}
                        <Link href={`/portal/test/${t.test_id}`}
                          className="flex items-center gap-1.5 text-xs font-semibold text-[#E8303A] bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl transition-colors">
                          <RotateCcw size={13} /> Làm lại
                        </Link>
                      </div>
                    </div>

                    {/* Previous attempts (if retaken) */}
                    {attempts.length > 1 && (
                      <div className="border-t border-gray-100 divide-y divide-gray-50">
                        {attempts.slice(1).map((r, i) => {
                          const rp = pct(r.total_correct, r.total_questions)
                          return (
                            <div key={r.id} className="flex items-center gap-3 px-5 py-2.5 bg-gray-50/50">
                              <span className="text-xs text-gray-400 w-16 shrink-0">Lần {attempts.length - i - 1}</span>
                              <span className="text-xs font-semibold text-[#1A2744] tabular-nums">
                                {r.total_correct}/{r.total_questions}
                                <span className={cn('ml-1.5 font-bold', rp >= 70 ? 'text-emerald-600' : rp >= 50 ? 'text-yellow-600' : 'text-red-500')}>
                                  ({rp}%)
                                </span>
                              </span>
                              <span className="text-xs text-gray-400 ml-auto">{new Date(r.submitted_at).toLocaleDateString('vi-VN')}</span>
                              <Link href={`/portal/result/${r.id}`}
                                className="text-xs font-semibold text-gray-400 hover:text-[#E8303A] transition-colors flex items-center gap-1">
                                <Eye size={11} /> Xem
                              </Link>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {tests.length === 0 && allResults.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <BookOpen size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Chưa có bài test nào được giao.</p>
          </div>
        )}
      </div>
    </div>
  )
}
