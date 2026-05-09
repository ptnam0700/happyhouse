'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Search, X, Pencil, Trash2, BookOpen, Headphones } from 'lucide-react'
import { toast } from 'sonner'
import { deletePassageById, togglePassageActive } from './actions'
import { Pagination } from '@/components/admin/Pagination'
import { cn } from '@/lib/utils'

interface Passage {
  id: string; title: string | null; type: string; level: string
  active: boolean; created_at: string | null; qCount: number
}

const PAGE_SIZE = 20
const LEVELS = ['A1','A2','B1','B2','C1','C2']

function ActiveToggle({ id, active }: { id: string; active: boolean }) {
  const [opt, setOpt]       = useState(active)
  const [, startTransition] = useTransition()
  const toggle = () => {
    const next = !opt; setOpt(next)
    startTransition(async () => {
      try { await togglePassageActive(id, opt) }
      catch { setOpt(!next); toast.error('Không thể cập nhật') }
    })
  }
  return (
    <button onClick={toggle} title={opt ? 'Click để ẩn' : 'Click để hiện'}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${opt ? 'bg-emerald-500' : 'bg-gray-200'}`}>
      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${opt ? 'translate-x-[18px]' : 'translate-x-1'}`} />
    </button>
  )
}

export function PassagesClient({ passages: initial }: { passages: Passage[] }) {
  const [passages, setPassages] = useState(initial)
  const [search,   setSearch]   = useState('')
  const [typeF,    setTypeF]    = useState('all')
  const [levelF,   setLevelF]   = useState('all')
  const [activeF,  setActiveF]  = useState('all')
  const [page,     setPage]     = useState(1)
  const [, startTransition]     = useTransition()

  const filtered = passages.filter(p => {
    const term = search.trim().toLowerCase()
    return (!term || (p.title ?? '').toLowerCase().includes(term)) &&
      (typeF   === 'all' || p.type   === typeF) &&
      (levelF  === 'all' || p.level  === levelF) &&
      (activeF === 'all' || (activeF === 'active' ? p.active : !p.active))
  })
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleDelete = (id: string, title: string | null) => {
    if (!confirm(`Xoá bài "${title ?? 'này'}"?`)) return
    startTransition(async () => {
      try { await deletePassageById(id); setPassages(prev => prev.filter(p => p.id !== id)); toast.success('Đã xoá') }
      catch { toast.error('Không thể xoá') }
    })
  }
  const onFilter = (fn: () => void) => { fn(); setPage(1) }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-gray-100 bg-white flex flex-wrap gap-2 items-center">
        <h1 className="text-base font-bold text-[#1A2744] mr-2">Bài đọc / Nghe</h1>
        {[{ v: 'all', l: 'Tất cả' }, { v: 'reading', l: '📖 Đọc' }, { v: 'listening', l: '🎧 Nghe' }].map(o => (
          <button key={o.v} onClick={() => onFilter(() => setTypeF(o.v))}
            className={cn('text-xs font-semibold px-2.5 py-1 rounded-full transition-colors',
              typeF === o.v ? 'bg-[#1A2744] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}>{o.l}</button>
        ))}
        <div className="w-px h-4 bg-gray-200" />
        {LEVELS.map(l => (
          <button key={l} onClick={() => onFilter(() => setLevelF(l === levelF ? 'all' : l))}
            className={cn('text-xs font-semibold px-2.5 py-1 rounded-full transition-colors',
              levelF === l ? 'bg-[#E8303A] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}>{l}</button>
        ))}
        <div className="w-px h-4 bg-gray-200" />
        {[{ v: 'all', l: 'Tất cả' }, { v: 'active', l: '● Active' }, { v: 'hidden', l: '○ Ẩn' }].map(o => (
          <button key={o.v} onClick={() => onFilter(() => setActiveF(o.v))}
            className={cn('text-xs font-semibold px-2.5 py-1 rounded-full transition-colors',
              activeF === o.v ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}>{o.l}</button>
        ))}
        <div className="relative ml-auto w-48">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => onFilter(() => setSearch(e.target.value))} placeholder="Tìm tiêu đề..."
            className="w-full h-8 pl-7 pr-7 rounded-xl border border-gray-200 bg-gray-50 text-xs placeholder:text-gray-300 focus:outline-none focus:border-[#E8303A]" />
          {search && <button onClick={() => onFilter(() => setSearch(''))} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"><X size={12} /></button>}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-3 space-y-2">
        {paginated.map(p => (
          <div key={p.id} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-[0_1px_4px_rgba(26,39,68,0.08)] group">
            <div className={`p-1.5 rounded-lg shrink-0 ${p.type === 'reading' ? 'bg-emerald-50' : 'bg-orange-50'}`}>
              {p.type === 'reading' ? <BookOpen size={15} className="text-emerald-600" /> : <Headphones size={15} className="text-orange-500" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${p.type === 'reading' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                  {p.type === 'reading' ? 'Đọc' : 'Nghe'}
                </span>
                <span className="text-[0.6rem] text-gray-400">{p.level}</span>
                <span className="font-semibold text-[#1A2744] text-sm truncate">{p.title ?? 'Không có tiêu đề'}</span>
              </div>
              <div className="text-xs text-gray-400 mt-0.5">{p.qCount} câu · {new Date(p.created_at!).toLocaleDateString('vi-VN')}</div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <ActiveToggle id={p.id} active={p.active} />
              <Link href={`/admin/passages/${p.id}`} className="p-1.5 rounded-lg text-gray-300 hover:text-[#1A2744] hover:bg-gray-100 transition-colors"><Pencil size={14} /></Link>
              <button onClick={() => handleDelete(p.id, p.title)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {!paginated.length && (
          <div className="text-center py-16 text-gray-400 text-sm">Không tìm thấy bài nào</div>
        )}
      </div>

      <div className="shrink-0 px-5 py-2.5 border-t border-gray-100 bg-white">
        <Pagination total={filtered.length} page={page} pageSize={PAGE_SIZE} onChange={setPage} />
      </div>
    </div>
  )
}
