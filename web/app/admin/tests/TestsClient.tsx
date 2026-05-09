'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Search, X, Pencil, Trash2, Globe, Lock, ClipboardList } from 'lucide-react'
import { toast } from 'sonner'
import { deleteTestById, toggleTestPublished } from './actions'
import { Pagination } from '@/components/admin/Pagination'
import { cn } from '@/lib/utils'

interface Test {
  id: string; name: string; description: string | null
  time_limit_sec: number; published: boolean; active: boolean
  created_at: string | null; qCount: number
}

const PAGE_SIZE = 20

function PublishToggle({ id, published }: { id: string; published: boolean }) {
  const [opt, setOpt]       = useState(published)
  const [, startTransition] = useTransition()
  const toggle = () => {
    const next = !opt; setOpt(next)
    startTransition(async () => {
      try { await toggleTestPublished(id, opt); toast.success(next ? 'Đã publish' : 'Đã ẩn') }
      catch { setOpt(!next); toast.error('Không thể cập nhật') }
    })
  }
  return (
    <button onClick={toggle}
      className={cn('flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full transition-all',
        opt ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200')}>
      {opt ? <Globe size={10} /> : <Lock size={10} />}
      {opt ? 'Live' : 'Draft'}
    </button>
  )
}

export function TestsClient({ tests: initial, siteUrl }: { tests: Test[]; siteUrl: string }) {
  const [tests, setTests]   = useState(initial)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [page,   setPage]   = useState(1)
  const [, startTransition] = useTransition()

  const filtered = tests.filter(t => {
    const term = search.trim().toLowerCase()
    return (!term || t.name.toLowerCase().includes(term) || (t.description ?? '').toLowerCase().includes(term)) &&
      (status === 'all' || (status === 'published' ? t.published : !t.published))
  })
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Xoá bài test "${name}"?`)) return
    startTransition(async () => {
      try { await deleteTestById(id); setTests(prev => prev.filter(t => t.id !== id)); toast.success('Đã xoá') }
      catch { toast.error('Không thể xoá') }
    })
  }
  const onFilter = (fn: () => void) => { fn(); setPage(1) }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-gray-100 bg-white flex flex-wrap gap-2 items-center">
        <h1 className="text-base font-bold text-[#1A2744] mr-2">Bài kiểm tra</h1>
        {[{ v: 'all', l: 'Tất cả' }, { v: 'published', l: '🟢 Live' }, { v: 'draft', l: '🔒 Draft' }].map(o => (
          <button key={o.v} onClick={() => onFilter(() => setStatus(o.v))}
            className={cn('text-xs font-semibold px-2.5 py-1 rounded-full transition-colors',
              status === o.v ? 'bg-[#1A2744] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}>{o.l}</button>
        ))}
        <div className="relative ml-auto w-52">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => onFilter(() => setSearch(e.target.value))} placeholder="Tìm tên bài test..."
            className="w-full h-8 pl-7 pr-7 rounded-xl border border-gray-200 bg-gray-50 text-xs placeholder:text-gray-300 focus:outline-none focus:border-[#E8303A]" />
          {search && <button onClick={() => onFilter(() => setSearch(''))} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"><X size={12} /></button>}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-3 space-y-2">
        {paginated.map(t => (
          <div key={t.id} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-[0_1px_4px_rgba(26,39,68,0.08)]">
            <div className={`p-1.5 rounded-lg shrink-0 ${t.published ? 'bg-emerald-50' : 'bg-gray-100'}`}>
              {t.published ? <Globe size={15} className="text-emerald-600" /> : <Lock size={15} className="text-gray-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-[#1A2744] text-sm truncate">{t.name}</span>
                <PublishToggle id={t.id} published={t.published} />
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5 flex-wrap">
                <span className="flex items-center gap-1"><ClipboardList size={10} /> {t.qCount} câu</span>
                <span>⏱ {Math.round(t.time_limit_sec / 60)} phút</span>
                {t.published && <span className="text-emerald-600 font-mono text-[0.65rem] truncate max-w-[200px]">{siteUrl}/t/{t.id}</span>}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Link href={`/admin/tests/${t.id}`} className="p-1.5 rounded-lg text-gray-300 hover:text-[#1A2744] hover:bg-gray-100 transition-colors"><Pencil size={14} /></Link>
              <button onClick={() => handleDelete(t.id, t.name)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {!paginated.length && (
          <div className="text-center py-16 text-gray-400 text-sm">Không tìm thấy bài test nào</div>
        )}
      </div>

      <div className="shrink-0 px-5 py-2.5 border-t border-gray-100 bg-white">
        <Pagination total={filtered.length} page={page} pageSize={PAGE_SIZE} onChange={setPage} />
      </div>
    </div>
  )
}
