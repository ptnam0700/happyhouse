'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Search, X, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteSession } from './actions'
import { cn } from '@/lib/utils'

interface Session {
  id: string; test_type: string; band_score: string | null
  total_correct: number | null; total_questions: number | null
  duration_sec: number | null; submitted_at: string | null
  student: { id: string; full_name: string; phone: string } | null
}

const BAND_COLOR: Record<string, string> = {
  '6.5 – 7.0': 'bg-emerald-100 text-emerald-700',
  '5.5 – 6.0': 'bg-blue-100 text-blue-700',
  '4.5 – 5.0': 'bg-yellow-100 text-yellow-700',
  '3.5 – 4.0': 'bg-orange-100 text-orange-700',
  'Below 3.5': 'bg-red-100 text-red-700',
}
const BANDS = ['6.5 – 7.0','5.5 – 6.0','4.5 – 5.0','3.5 – 4.0','Below 3.5']

function fmt(sec: number | null) {
  if (!sec) return '—'
  return `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, '0')}`
}

export function SessionsClient({ sessions: initial }: { sessions: Session[] }) {
  const [sessions, setSessions] = useState(initial)
  const [search,   setSearch]   = useState('')
  const [band,     setBand]     = useState('all')
  const [testType, setTestType] = useState('all')
  const [, startTransition]     = useTransition()

  const filtered = sessions.filter(s => {
    const term = search.trim().toLowerCase()
    const matchSearch = !term ||
      (s.student?.full_name ?? '').toLowerCase().includes(term) ||
      (s.student?.phone ?? '').includes(term)
    const matchBand = band === 'all' || s.band_score === band
    const matchType = testType === 'all' || s.test_type === testType
    return matchSearch && matchBand && matchType
  })

  const handleDelete = (id: string) => {
    if (!confirm('Xoá bài thi này? Không thể khôi phục.')) return
    startTransition(async () => {
      try {
        await deleteSession(id)
        setSessions(prev => prev.filter(s => s.id !== id))
        toast.success('Đã xoá bài thi')
      } catch { toast.error('Không thể xoá') }
    })
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex flex-wrap gap-2">
          {/* Type filter */}
          {[{ v: 'all', l: 'Tất cả' }, { v: 'full', l: 'Full Test' }, { v: 'mini', l: 'Mini Test' }].map(opt => (
            <button key={opt.v} onClick={() => setTestType(opt.v)}
              className={cn('text-xs font-semibold px-3 py-1.5 rounded-full transition-colors',
                testType === opt.v ? 'bg-[#1A2744] text-white' : 'bg-white text-gray-500 hover:bg-gray-100 shadow-sm')}>
              {opt.l}
            </button>
          ))}
          <div className="w-px bg-gray-200 mx-1" />
          {/* Band filter */}
          <button onClick={() => setBand('all')}
            className={cn('text-xs font-semibold px-3 py-1.5 rounded-full transition-colors',
              band === 'all' ? 'bg-[#E8303A] text-white' : 'bg-white text-gray-500 hover:bg-gray-100 shadow-sm')}>
            Tất cả band
          </button>
          {BANDS.map(b => (
            <button key={b} onClick={() => setBand(b === band ? 'all' : b)}
              className={cn('text-xs font-semibold px-3 py-1.5 rounded-full transition-colors',
                band === b ? 'bg-[#E8303A] text-white' : 'bg-white text-gray-500 hover:bg-gray-100 shadow-sm')}>
              {b}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tên hoặc số điện thoại..."
            className="w-full h-9 pl-8 pr-8 rounded-xl border border-gray-200 bg-white text-sm placeholder:text-gray-300 focus:outline-none focus:border-[#E8303A]" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-2.5">{filtered.length} / {sessions.length} bài thi</p>

      <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(26,39,68,0.08)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Học viên</th>
                <th className="text-left px-3 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Loại</th>
                <th className="text-left px-3 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Band</th>
                <th className="text-left px-3 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Điểm</th>
                <th className="text-left px-3 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden sm:table-cell">TG làm</th>
                <th className="text-left px-3 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Ngày</th>
                <th className="px-3 py-3.5 text-center" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => {
                const pct = s.total_questions ? Math.round((s.total_correct! / s.total_questions) * 100) : 0
                return (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      {s.student ? (
                        <Link href={`/admin/students/${s.student.id}`} className="hover:text-[#E8303A] transition-colors">
                          <div className="font-semibold text-[#1A2744]">{s.student.full_name}</div>
                          <div className="text-xs text-gray-400">{s.student.phone}</div>
                        </Link>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-3 py-3.5">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.test_type === 'full' ? 'bg-[#1A2744]/10 text-[#1A2744]' : 'bg-gray-100 text-gray-500'}`}>
                        {s.test_type}
                      </span>
                    </td>
                    <td className="px-3 py-3.5">
                      {s.band_score
                        ? <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${BAND_COLOR[s.band_score] ?? 'bg-gray-100 text-gray-500'}`}>{s.band_score}</span>
                        : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-3 py-3.5 tabular-nums">
                      <span className="font-semibold text-[#1A2744]">{s.total_correct}</span>
                      <span className="text-gray-400">/{s.total_questions}</span>
                      <span className="text-gray-400 text-xs ml-1">({pct}%)</span>
                    </td>
                    <td className="px-3 py-3.5 text-gray-400 hidden sm:table-cell tabular-nums">{fmt(s.duration_sec)}</td>
                    <td className="px-3 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                      {s.submitted_at ? new Date(s.submitted_at).toLocaleDateString('vi-VN') : '—'}
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      <button onClick={() => handleDelete(s.id)}
                        className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                )
              })}
              {!filtered.length && (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400">
                  {search || band !== 'all' || testType !== 'all' ? 'Không tìm thấy bài thi' : 'Chưa có dữ liệu'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
