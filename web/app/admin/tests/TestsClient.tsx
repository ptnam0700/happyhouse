'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Search, X, Pencil, Trash2, Globe, Lock, ClipboardList } from 'lucide-react'
import { toast } from 'sonner'
import { deleteTestById, toggleTestPublished } from './actions'
import { cn } from '@/lib/utils'

interface Test {
  id: string; name: string; description: string | null
  time_limit_sec: number; published: boolean; active: boolean
  created_at: string | null; qCount: number
}

const SITE = typeof window !== 'undefined' ? window.location.origin : ''

function PublishToggle({ id, published }: { id: string; published: boolean }) {
  const [opt, setOpt]       = useState(published)
  const [, startTransition] = useTransition()
  const toggle = () => {
    const next = !opt; setOpt(next)
    startTransition(async () => {
      try {
        await toggleTestPublished(id, opt)
        toast.success(next ? 'Đã publish bài test' : 'Đã ẩn bài test')
      } catch { setOpt(!next); toast.error('Không thể cập nhật') }
    })
  }
  return (
    <button onClick={toggle} title={opt ? 'Click để ẩn' : 'Click để publish'}
      className={cn('flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-all',
        opt ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200')}>
      {opt ? <Globe size={11} /> : <Lock size={11} />}
      {opt ? 'Published' : 'Draft'}
    </button>
  )
}

export function TestsClient({ tests: initial, siteUrl }: { tests: Test[]; siteUrl: string }) {
  const [tests, setTests]   = useState(initial)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [, startTransition] = useTransition()

  const filtered = tests.filter(t => {
    const term = search.trim().toLowerCase()
    const matchSearch = !term || t.name.toLowerCase().includes(term) || (t.description ?? '').toLowerCase().includes(term)
    const matchStatus = status === 'all' || (status === 'published' ? t.published : !t.published)
    return matchSearch && matchStatus
  })

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Xoá bài test "${name}"? Dữ liệu bài làm của học viên vẫn được giữ.`)) return
    startTransition(async () => {
      try {
        await deleteTestById(id)
        setTests(prev => prev.filter(t => t.id !== id))
        toast.success('Đã xoá bài test')
      } catch { toast.error('Không thể xoá') }
    })
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex gap-2 flex-wrap">
          {[{ v: 'all', l: 'Tất cả' }, { v: 'published', l: '🟢 Published' }, { v: 'draft', l: '🔒 Draft' }].map(opt => (
            <button key={opt.v} onClick={() => setStatus(opt.v)}
              className={cn('text-xs font-semibold px-3 py-1.5 rounded-full transition-colors',
                status === opt.v ? 'bg-[#1A2744] text-white' : 'bg-white text-gray-500 hover:bg-gray-100 shadow-sm')}>
              {opt.l}
            </button>
          ))}
        </div>
        <div className="relative sm:ml-auto w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên bài test..."
            className="w-full h-9 pl-8 pr-8 rounded-xl border border-gray-200 bg-white text-sm placeholder:text-gray-300 focus:outline-none focus:border-[#E8303A]" />
          {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"><X size={13} /></button>}
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-2.5">{filtered.length} / {tests.length} bài test</p>

      <div className="space-y-2.5">
        {filtered.map(t => (
          <div key={t.id} className="flex items-center gap-4 bg-white rounded-2xl px-5 py-4 shadow-[0_2px_8px_rgba(26,39,68,0.08)]">
            <div className={`p-2 rounded-xl shrink-0 ${t.published ? 'bg-emerald-50' : 'bg-gray-100'}`}>
              {t.published ? <Globe size={18} className="text-emerald-600" /> : <Lock size={18} className="text-gray-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-[#1A2744] truncate">{t.name}</span>
                <PublishToggle id={t.id} published={t.published} />
              </div>
              <div className="mt-0.5 flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                <span className="flex items-center gap-1"><ClipboardList size={11} /> {t.qCount} câu hỏi</span>
                <span>⏱ {Math.round(t.time_limit_sec / 60)} phút</span>
                {t.description && <span className="truncate max-w-[200px]">{t.description}</span>}
              </div>
              {t.published && (
                <div className="mt-1 text-xs text-emerald-600 font-mono truncate">{siteUrl}/t/{t.id}</div>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Link href={`/admin/tests/${t.id}`}
                className="p-1.5 rounded-lg text-gray-300 hover:text-[#1A2744] hover:bg-gray-100 transition-colors">
                <Pencil size={15} />
              </Link>
              <button onClick={() => handleDelete(t.id, t.name)}
                className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
        {!filtered.length && (
          <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-2xl shadow-[0_2px_8px_rgba(26,39,68,0.08)]">
            Không tìm thấy bài test nào
          </div>
        )}
      </div>
    </>
  )
}
