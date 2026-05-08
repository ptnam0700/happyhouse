'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Search, X, Pencil, Trash2, BookOpen, Headphones } from 'lucide-react'
import { toast } from 'sonner'
import { deletePassageById, togglePassageActive } from './actions'
import { cn } from '@/lib/utils'

interface Passage {
  id: string; title: string | null; type: string; level: string
  active: boolean; created_at: string | null; qCount: number
}

const LEVELS = ['A1','A2','B1','B2','C1','C2']

function ActiveToggle({ id, active }: { id: string; active: boolean }) {
  const [opt, setOpt]          = useState(active)
  const [, startTransition]    = useTransition()
  const toggle = () => {
    const next = !opt; setOpt(next)
    startTransition(async () => {
      try { await togglePassageActive(id, opt) }
      catch { setOpt(!next); toast.error('Không thể cập nhật trạng thái') }
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
  const [, startTransition]     = useTransition()

  const filtered = passages.filter(p => {
    const term = search.trim().toLowerCase()
    const matchSearch = !term || (p.title ?? '').toLowerCase().includes(term)
    const matchType   = typeF   === 'all' || p.type   === typeF
    const matchLevel  = levelF  === 'all' || p.level  === levelF
    const matchActive = activeF === 'all' || (activeF === 'active' ? p.active : !p.active)
    return matchSearch && matchType && matchLevel && matchActive
  })

  const handleDelete = (id: string, title: string | null) => {
    if (!confirm(`Xoá bài "${title ?? 'này'}"? Câu hỏi liên kết sẽ bị bỏ liên kết (không xoá).`)) return
    startTransition(async () => {
      try {
        await deletePassageById(id)
        setPassages(prev => prev.filter(p => p.id !== id))
        toast.success('Đã xoá bài')
      } catch { toast.error('Không thể xoá bài') }
    })
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex flex-wrap gap-2">
          {/* Type */}
          {[{ v: 'all', l: 'Tất cả' }, { v: 'reading', l: '📖 Đọc' }, { v: 'listening', l: '🎧 Nghe' }].map(opt => (
            <button key={opt.v} onClick={() => setTypeF(opt.v)}
              className={cn('text-xs font-semibold px-3 py-1.5 rounded-full transition-colors',
                typeF === opt.v ? 'bg-[#1A2744] text-white' : 'bg-white text-gray-500 hover:bg-gray-100 shadow-sm')}>
              {opt.l}
            </button>
          ))}
          <div className="w-px bg-gray-200 mx-1" />
          {/* Level */}
          <button onClick={() => setLevelF('all')}
            className={cn('text-xs font-semibold px-3 py-1.5 rounded-full transition-colors',
              levelF === 'all' ? 'bg-[#E8303A] text-white' : 'bg-white text-gray-500 hover:bg-gray-100 shadow-sm')}>
            Cấp
          </button>
          {LEVELS.map(l => (
            <button key={l} onClick={() => setLevelF(l === levelF ? 'all' : l)}
              className={cn('text-xs font-semibold px-3 py-1.5 rounded-full transition-colors',
                levelF === l ? 'bg-[#E8303A] text-white' : 'bg-white text-gray-500 hover:bg-gray-100 shadow-sm')}>
              {l}
            </button>
          ))}
          <div className="w-px bg-gray-200 mx-1" />
          {[{ v: 'all', l: 'Tất cả' }, { v: 'active', l: 'Active' }, { v: 'hidden', l: 'Ẩn' }].map(opt => (
            <button key={opt.v} onClick={() => setActiveF(opt.v)}
              className={cn('text-xs font-semibold px-3 py-1.5 rounded-full transition-colors',
                activeF === opt.v ? 'bg-emerald-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-100 shadow-sm')}>
              {opt.l}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tiêu đề..."
            className="w-full h-9 pl-8 pr-8 rounded-xl border border-gray-200 bg-white text-sm placeholder:text-gray-300 focus:outline-none focus:border-[#E8303A]" />
          {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"><X size={13} /></button>}
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-2.5">{filtered.length} / {passages.length} bài</p>

      <div className="space-y-2">
        {filtered.map(p => (
          <div key={p.id} className="flex items-center gap-4 bg-white rounded-2xl px-5 py-4 shadow-[0_2px_8px_rgba(26,39,68,0.08)] group">
            <div className={`p-2 rounded-xl shrink-0 ${p.type === 'reading' ? 'bg-emerald-50' : 'bg-orange-50'}`}>
              {p.type === 'reading' ? <BookOpen size={18} className="text-emerald-600" /> : <Headphones size={18} className="text-orange-500" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${p.type === 'reading' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                  {p.type === 'reading' ? 'Đọc' : 'Nghe'}
                </span>
                <span className="text-xs text-gray-400 font-medium">{p.level}</span>
                <span className="font-semibold text-[#1A2744] truncate">{p.title ?? 'Không có tiêu đề'}</span>
              </div>
              <div className="mt-0.5 text-xs text-gray-400">{p.qCount} câu hỏi · {new Date(p.created_at!).toLocaleDateString('vi-VN')}</div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <ActiveToggle id={p.id} active={p.active} />
              <Link href={`/admin/passages/${p.id}`}
                className="p-1.5 rounded-lg text-gray-300 hover:text-[#1A2744] hover:bg-gray-100 transition-colors">
                <Pencil size={15} />
              </Link>
              <button onClick={() => handleDelete(p.id, p.title)}
                className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
        {!filtered.length && (
          <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-2xl shadow-[0_2px_8px_rgba(26,39,68,0.08)]">
            Không tìm thấy bài nào
          </div>
        )}
      </div>
    </>
  )
}
