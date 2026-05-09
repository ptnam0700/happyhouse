'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, X, ChevronRight } from 'lucide-react'
import { Pagination } from '@/components/admin/Pagination'
import { cn } from '@/lib/utils'

interface Student {
  id: string; full_name: string; phone: string | null; email: string | null
  status: string; enrollment_date: string | null; class_id: string | null; class_name: string | null
}
interface Cls { id: string; name: string }

const PAGE_SIZE = 25
const STATUS_STYLE: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700', paused: 'bg-yellow-100 text-yellow-700',
  graduated: 'bg-blue-100 text-blue-700', dropped: 'bg-gray-100 text-gray-500',
}
const STATUS_LABEL: Record<string, string> = {
  active: 'Đang học', paused: 'Tạm dừng', graduated: 'Tốt nghiệp', dropped: 'Nghỉ học',
}

export function SchoolStudentsClient({ students, classes }: { students: Student[]; classes: Cls[] }) {
  const [search,   setSearch]  = useState('')
  const [classF,   setClassF]  = useState('all')
  const [statusF,  setStatusF] = useState('all')
  const [page,     setPage]    = useState(1)

  const filtered = students.filter(s => {
    const term = search.trim().toLowerCase()
    return (!term || s.full_name.toLowerCase().includes(term) || (s.phone ?? '').includes(term)) &&
      (classF  === 'all' || s.class_id === classF) &&
      (statusF === 'all' || s.status   === statusF)
  })
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const onFilter = (fn: () => void) => { fn(); setPage(1) }

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ minHeight: 0 }}>
      <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-gray-100 bg-[#F7F6F2] flex flex-wrap gap-2 items-center">
        {[{ v: 'all', l: 'Tất cả' }, { v: 'active', l: 'Đang học' }, { v: 'paused', l: 'Tạm dừng' }, { v: 'graduated', l: 'Tốt nghiệp' }, { v: 'dropped', l: 'Nghỉ học' }].map(o => (
          <button key={o.v} onClick={() => onFilter(() => setStatusF(o.v))}
            className={cn('text-xs font-semibold px-2.5 py-1 rounded-full transition-colors',
              statusF === o.v ? 'bg-[#1A2744] text-white' : 'bg-white text-gray-500 hover:bg-gray-100 shadow-sm')}>{o.l}</button>
        ))}
        <select value={classF} onChange={e => onFilter(() => setClassF(e.target.value))}
          className="h-8 rounded-xl border border-gray-200 bg-white px-2.5 text-xs text-gray-600 focus:outline-none focus:border-[#E8303A]">
          <option value="all">Tất cả lớp</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <div className="relative ml-auto w-52">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => onFilter(() => setSearch(e.target.value))} placeholder="Tên hoặc SĐT..."
            className="w-full h-8 pl-7 pr-7 rounded-xl border border-gray-200 bg-white text-xs placeholder:text-gray-300 focus:outline-none focus:border-[#E8303A]" />
          {search && <button onClick={() => onFilter(() => setSearch(''))} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"><X size={12} /></button>}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-white shadow-[0_1px_0_0_#e5e7eb]">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Học viên</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden md:table-cell">Lớp</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden sm:table-cell">Nhập học</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Trạng thái</th>
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-50">
            {paginated.map(s => (
              <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-3">
                  <div className="font-semibold text-[#1A2744]">{s.full_name}</div>
                  {s.phone && <div className="text-xs text-gray-400">{s.phone}</div>}
                </td>
                <td className="px-3 py-3 hidden md:table-cell">
                  {s.class_name ? (
                    <Link href={`/admin/school/classes/${s.class_id}`} className="text-xs text-[#1A2744] hover:text-[#E8303A] transition-colors">{s.class_name}</Link>
                  ) : <span className="text-gray-300 text-xs">—</span>}
                </td>
                <td className="px-3 py-3 text-xs text-gray-400 hidden sm:table-cell">
                  {s.enrollment_date ? new Date(s.enrollment_date).toLocaleDateString('vi-VN') : '—'}
                </td>
                <td className="px-3 py-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[s.status] ?? 'bg-gray-100 text-gray-500'}`}>
                    {STATUS_LABEL[s.status] ?? s.status}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <Link href={`/admin/school/students/${s.id}`} className="p-1.5 rounded-lg text-gray-300 hover:text-[#1A2744] hover:bg-gray-100 transition-colors inline-flex">
                    <ChevronRight size={14} />
                  </Link>
                </td>
              </tr>
            ))}
            {!paginated.length && (
              <tr><td colSpan={5} className="px-5 py-16 text-center text-gray-400 text-sm">
                {search || classF !== 'all' || statusF !== 'all' ? 'Không tìm thấy' : 'Chưa có học viên nào'}
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
