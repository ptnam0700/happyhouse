'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Search, X, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Pagination } from '@/components/admin/Pagination'
import { deleteSession } from './actions'
import { cn } from '@/lib/utils'

interface Session {
  id: string; test_type: string; band_score: string | null
  total_correct: number | null; total_questions: number | null
  duration_sec: number | null; submitted_at: string | null
  student: { id: string; full_name: string; phone: string } | null
}

const PAGE_SIZE = 20
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
  const [page,     setPage]     = useState(1)
  const [, startTransition]     = useTransition()

  const filtered = sessions.filter(s => {
    const term = search.trim().toLowerCase()
    const matchSearch = !term || (s.student?.full_name ?? '').toLowerCase().includes(term) || (s.student?.phone ?? '').includes(term)
    return matchSearch && (band === 'all' || s.band_score === band) && (testType === 'all' || s.test_type === testType)
  })
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleDelete = (id: string) => {
    if (!confirm('Xoá bài thi này?')) return
    startTransition(async () => {
      try { await deleteSession(id); setSessions(prev => prev.filter(s => s.id !== id)); toast.success('Đã xoá') }
      catch { toast.error('Không thể xoá') }
    })
  }
  const onFilter = (fn: () => void) => { fn(); setPage(1) }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-gray-100 bg-white flex flex-wrap gap-2 items-center">
        <h1 className="text-base font-bold text-[#1A2744] mr-2">Bài thi</h1>
        {[{ v: 'all', l: 'Tất cả' }, { v: 'full', l: 'Full' }, { v: 'mini', l: 'Mini' }].map(o => (
          <button key={o.v} onClick={() => onFilter(() => setTestType(o.v))}
            className={cn('text-xs font-semibold px-2.5 py-1 rounded-full transition-colors',
              testType === o.v ? 'bg-[#1A2744] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}>{o.l}</button>
        ))}
        <div className="w-px h-4 bg-gray-200" />
        <button onClick={() => onFilter(() => setBand('all'))}
          className={cn('text-xs font-semibold px-2.5 py-1 rounded-full transition-colors', band === 'all' ? 'bg-[#E8303A] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}>
          Band
        </button>
        {BANDS.map(b => (
          <button key={b} onClick={() => onFilter(() => setBand(b === band ? 'all' : b))}
            className={cn('text-xs font-semibold px-2.5 py-1 rounded-full transition-colors',
              band === b ? 'bg-[#E8303A] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}>{b}</button>
        ))}
        <div className="relative ml-auto w-52">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => onFilter(() => setSearch(e.target.value))} placeholder="Tên hoặc SĐT..."
            className="w-full h-8 pl-7 pr-7 rounded-xl border border-gray-200 bg-gray-50 text-xs placeholder:text-gray-300 focus:outline-none focus:border-[#E8303A]" />
          {search && <button onClick={() => onFilter(() => setSearch(''))} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"><X size={12} /></button>}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-white shadow-[0_1px_0_0_#e5e7eb]">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Học viên</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Loại</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Band</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Điểm</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden sm:table-cell">TG làm</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Ngày</th>
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-50">
            {paginated.map(s => {
              const pct = s.total_questions ? Math.round((s.total_correct! / s.total_questions) * 100) : 0
              return (
                <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    {s.student ? (
                      <Link href={`/admin/students/${s.student.id}`} className="hover:text-[#E8303A] transition-colors">
                        <div className="font-semibold text-[#1A2744]">{s.student.full_name}</div>
                        <div className="text-xs text-gray-400">{s.student.phone}</div>
                      </Link>
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-3 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.test_type === 'full' ? 'bg-[#1A2744]/10 text-[#1A2744]' : 'bg-gray-100 text-gray-500'}`}>{s.test_type}</span>
                  </td>
                  <td className="px-3 py-3">
                    {s.band_score ? <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${BAND_COLOR[s.band_score] ?? 'bg-gray-100 text-gray-500'}`}>{s.band_score}</span>
                      : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-3 py-3 tabular-nums">
                    <span className="font-semibold text-[#1A2744]">{s.total_correct}</span><span className="text-gray-400">/{s.total_questions}</span>
                    <span className="text-gray-400 text-xs ml-1">({pct}%)</span>
                  </td>
                  <td className="px-3 py-3 text-gray-400 hidden sm:table-cell tabular-nums text-xs">{fmt(s.duration_sec)}</td>
                  <td className="px-3 py-3 text-xs text-gray-400 whitespace-nowrap">
                    {s.submitted_at ? new Date(s.submitted_at).toLocaleDateString('vi-VN') : '—'}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={13} /></button>
                  </td>
                </tr>
              )
            })}
            {!paginated.length && (
              <tr><td colSpan={7} className="px-5 py-16 text-center text-gray-400 text-sm">
                {search || band !== 'all' || testType !== 'all' ? 'Không tìm thấy' : 'Chưa có dữ liệu'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="shrink-0 px-5 py-2.5 border-t border-gray-100 bg-white">
        <Pagination total={filtered.length} page={page} pageSize={PAGE_SIZE} onChange={setPage} />
      </div>
    </div>
  )
}
