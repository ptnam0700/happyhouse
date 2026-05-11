'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Plus, Search, X, Trash2, Pencil, Gamepad2, Upload, BookOpen } from 'lucide-react'
import { deleteWord } from '../actions'
import { cn } from '@/lib/utils'

interface Word {
  id: string; word: string; pronunciation?: string; part_of_speech?: string
  definition?: string; definition_vi?: string; image_url?: string
  synonyms: string[]; tags: string[]; difficulty: string
}

const STATUS_STYLE: Record<string, string> = {
  new:      'bg-gray-100 text-gray-500',
  learning: 'bg-blue-100 text-blue-700',
  review:   'bg-yellow-100 text-yellow-700',
  mastered: 'bg-emerald-100 text-emerald-700',
}
const STATUS_LABEL: Record<string, string> = { new:'Mới', learning:'Đang học', review:'Ôn tập', mastered:'Thuộc' }
const DIFF_STYLE: Record<string, string>   = { easy:'text-emerald-600', medium:'text-yellow-600', hard:'text-red-500' }

export function WordListClient({ collection, words: initial, progressMap, studentId }: {
  collection: any; words: Word[]; progressMap: Record<string, string>; studentId: string
}) {
  const [words, setWords]   = useState(initial)
  const [search, setSearch] = useState('')
  const [, startTransition] = useTransition()

  const filtered = words.filter(w => {
    const term = search.trim().toLowerCase()
    return !term || w.word.toLowerCase().includes(term) || (w.definition ?? '').toLowerCase().includes(term) || (w.definition_vi ?? '').toLowerCase().includes(term)
  })

  const masteredCount = words.filter(w => progressMap[w.id] === 'mastered').length
  const pct = words.length ? Math.round(masteredCount / words.length * 100) : 0

  const handleDelete = (id: string) => {
    if (!confirm('Xoá từ này?')) return
    startTransition(async () => {
      await deleteWord(id, collection.id)
      setWords(prev => prev.filter(w => w.id !== id))
    })
  }

  return (
    <div className="min-h-screen bg-[#F7F6F2]">
      {/* Header */}
      <header style={{ background: collection.color }} className="px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Link href="/portal/vocab" className="text-white/80 hover:text-white text-sm font-medium transition-colors">← Bộ từ vựng</Link>
          <div className="flex items-center gap-2">
            <Link href={`/portal/vocab/${collection.id}/import`}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors">
              <Upload size={13} /> Import
            </Link>
            {words.length > 0 && (
              <Link href={`/portal/vocab/${collection.id}/study`}
                className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors">
                <Gamepad2 size={13} /> Học ngay
              </Link>
            )}
            <Link href={`/portal/vocab/${collection.id}/add`}
              className="flex items-center gap-1.5 bg-white text-xs font-bold px-3 py-2 rounded-xl transition-colors" style={{ color: collection.color }}>
              <Plus size={13} /> Thêm từ
            </Link>
          </div>
        </div>
        <div className="mt-3">
          <h1 className="text-xl font-bold text-white">{collection.name}</h1>
          {collection.description && <p className="text-white/70 text-sm mt-0.5">{collection.description}</p>}
          <div className="flex items-center gap-4 mt-2 text-white/80 text-xs">
            <span><strong className="text-white">{words.length}</strong> từ</span>
            <span><strong className="text-white">{masteredCount}</strong> đã thuộc ({pct}%)</span>
          </div>
          {words.length > 0 && (
            <div className="mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden w-full max-w-xs">
              <div className="h-full bg-white rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
          )}
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Search */}
        {words.length > 3 && (
          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm từ..."
              className="w-full h-10 pl-8 pr-8 rounded-xl border border-gray-200 bg-white text-sm placeholder:text-gray-300 focus:outline-none focus:border-[#E8303A]" />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"><X size={13} /></button>}
          </div>
        )}

        {/* Empty state */}
        {words.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <BookOpen size={36} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold text-[#1A2744] mb-1">Chưa có từ nào</p>
            <p className="text-sm mb-5">Thêm từ đầu tiên hoặc import từ Excel</p>
            <div className="flex justify-center gap-3">
              <Link href={`/portal/vocab/${collection.id}/add`} className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl text-white transition-colors" style={{ background: collection.color }}>
                <Plus size={15} /> Thêm từ
              </Link>
              <Link href={`/portal/vocab/${collection.id}/import`} className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors">
                <Upload size={15} /> Import Excel
              </Link>
            </div>
          </div>
        )}

        {/* Word list */}
        <div className="space-y-2">
          {filtered.map(w => (
            <div key={w.id} className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(26,39,68,0.08)] overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3.5">
                {/* Colour dot = status */}
                <div className={cn('w-2 h-2 rounded-full shrink-0 mt-0.5', {
                  'bg-gray-300':    (progressMap[w.id] ?? 'new') === 'new',
                  'bg-blue-400':    progressMap[w.id] === 'learning',
                  'bg-yellow-400':  progressMap[w.id] === 'review',
                  'bg-emerald-500': progressMap[w.id] === 'mastered',
                })} />

                {/* Word + meaning */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-bold text-[#1A2744] text-[15px]">{w.word}</span>
                    {w.pronunciation && <span className="text-xs text-gray-400">{w.pronunciation}</span>}
                    {w.part_of_speech && <span className="text-[0.65rem] text-purple-500 font-semibold italic">{w.part_of_speech}</span>}
                  </div>
                  {(w.definition_vi || w.definition) && (
                    <p className="text-sm text-gray-500 truncate mt-0.5">
                      {w.definition_vi || w.definition}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <span className={cn('text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full hidden sm:inline-block', STATUS_STYLE[progressMap[w.id] ?? 'new'])}>
                    {STATUS_LABEL[progressMap[w.id] ?? 'new']}
                  </span>
                  <Link href={`/portal/vocab/${collection.id}/add?edit=${w.id}`} className="p-1.5 rounded-lg text-gray-300 hover:text-[#1A2744] hover:bg-gray-100 transition-colors">
                    <Pencil size={13} />
                  </Link>
                  <button onClick={() => handleDelete(w.id)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              {/* Synonyms row — only if present */}
              {w.synonyms.length > 0 && (
                <div className="flex gap-1.5 flex-wrap px-4 pb-3 -mt-1">
                  <span className="text-[0.65rem] text-gray-300">≈</span>
                  {w.synonyms.slice(0, 3).map(s => (
                    <span key={s} className="text-[0.65rem] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full">{s}</span>
                  ))}
                  {w.synonyms.length > 3 && <span className="text-[0.65rem] text-gray-300">+{w.synonyms.length - 3}</span>}
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && search && (
            <p className="text-center py-8 text-gray-400 text-sm">Không tìm thấy từ nào</p>
          )}
        </div>
      </div>
    </div>
  )
}
