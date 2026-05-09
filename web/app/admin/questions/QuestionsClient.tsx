'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Search, X, Pencil, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { ToggleActiveButton } from './ToggleActiveButton'
import { deleteQuestionById } from './deleteAction'
import { Pagination } from '@/components/admin/Pagination'
import { cn } from '@/lib/utils'

interface Question {
  id: string; section: string; type: string; level: string | null
  question_text: string; active: boolean | null; passage_id: string | null
}

const PAGE_SIZE = 25

const SECTION_LABEL: Record<string, { label: string; color: string }> = {
  grammar:    { label: 'Ngữ pháp', color: 'bg-purple-100 text-purple-700' },
  vocabulary: { label: 'Từ vựng',  color: 'bg-blue-100 text-blue-700'    },
  reading:    { label: 'Đọc hiểu', color: 'bg-emerald-100 text-emerald-700' },
  listening:  { label: 'Nghe',     color: 'bg-orange-100 text-orange-700' },
}
const TYPE_LABEL: Record<string, string> = {
  multiple_choice: 'MC', fill_blank: 'Fill', true_false: 'T/F', reading: 'MC', listening: 'MC',
}

function DeleteButton({ id, onDeleted }: { id: string; onDeleted: () => void }) {
  const [, startTransition] = useTransition()
  const handle = () => {
    if (!confirm('Xoá câu hỏi này?')) return
    startTransition(async () => {
      try { await deleteQuestionById(id); onDeleted() }
      catch { toast.error('Không thể xoá') }
    })
  }
  return (
    <button onClick={handle} className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={13} /></button>
  )
}

export function QuestionsClient({ questions: initial }: { questions: Question[] }) {
  const [questions, setQuestions] = useState(initial)
  const [section,   setSection]   = useState('all')
  const [search,    setSearch]    = useState('')
  const [page,      setPage]      = useState(1)

  const counts = {
    all:        initial.length,
    grammar:    initial.filter(q => q.section === 'grammar').length,
    vocabulary: initial.filter(q => q.section === 'vocabulary').length,
    reading:    initial.filter(q => q.section === 'reading').length,
    listening:  initial.filter(q => q.section === 'listening').length,
  }
  const filters = [
    { key: 'all',        label: 'Tất cả',   count: counts.all        },
    { key: 'grammar',    label: 'Ngữ pháp', count: counts.grammar    },
    { key: 'vocabulary', label: 'Từ vựng',  count: counts.vocabulary },
    { key: 'reading',    label: 'Đọc hiểu', count: counts.reading    },
    { key: 'listening',  label: 'Nghe',     count: counts.listening  },
  ]

  const filtered = questions.filter(q => {
    const term = search.trim().toLowerCase()
    return (section === 'all' || q.section === section) &&
      (!term || q.question_text.toLowerCase().includes(term))
  })
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const onFilter = (fn: () => void) => { fn(); setPage(1) }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-gray-100 bg-white flex flex-wrap gap-2 items-center">
        <h1 className="text-base font-bold text-[#1A2744] mr-2">Câu hỏi</h1>
        {filters.map(f => (
          <button key={f.key} onClick={() => onFilter(() => setSection(f.key))}
            className={cn('text-xs font-semibold px-2.5 py-1 rounded-full transition-colors',
              section === f.key ? 'bg-[#1A2744] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}>
            {f.label} <span className={cn('ml-1', section === f.key ? 'opacity-70' : 'text-gray-400')}>{f.count}</span>
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <div className="relative w-52">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => onFilter(() => setSearch(e.target.value))} placeholder="Tìm câu hỏi..."
              className="w-full h-8 pl-7 pr-7 rounded-xl border border-gray-200 bg-gray-50 text-xs placeholder:text-gray-300 focus:outline-none focus:border-[#E8303A]" />
            {search && <button onClick={() => onFilter(() => setSearch(''))} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"><X size={12} /></button>}
          </div>
          <Link href="/admin/questions/new"
            className="flex items-center gap-1 h-8 px-3 rounded-xl bg-[#E8303A] hover:bg-[#C0222B] text-white text-xs font-semibold transition-colors shrink-0">
            <Plus size={13} /> Thêm
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-white shadow-[0_1px_0_0_#e5e7eb]">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Câu hỏi</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden sm:table-cell">Phần</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden md:table-cell">Loại</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden md:table-cell">Cấp</th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-50">
            {paginated.map((q, i) => {
              const sec = SECTION_LABEL[q.section]
              return (
                <tr key={q.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-start gap-2.5">
                      <span className="text-xs text-gray-300 font-mono mt-0.5 shrink-0 w-6 tabular-nums">{(page - 1) * PAGE_SIZE + i + 1}</span>
                      <span className="text-[#1A2744] line-clamp-2 leading-snug text-sm">{q.question_text}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 hidden sm:table-cell">
                    {sec && <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${sec.color}`}>{sec.label}</span>}
                  </td>
                  <td className="px-3 py-3 hidden md:table-cell"><span className="text-xs font-mono text-gray-400">{TYPE_LABEL[q.type] ?? q.type}</span></td>
                  <td className="px-3 py-3 hidden md:table-cell"><span className="text-xs text-gray-400">{q.level ?? '—'}</span></td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <ToggleActiveButton id={q.id} active={q.active ?? false} />
                      <Link href={`/admin/questions/${q.id}`} className="p-1.5 rounded-lg text-gray-300 hover:text-[#1A2744] hover:bg-gray-100 transition-colors"><Pencil size={13} /></Link>
                      <DeleteButton id={q.id} onDeleted={() => setQuestions(prev => prev.filter(x => x.id !== q.id))} />
                    </div>
                  </td>
                </tr>
              )
            })}
            {!paginated.length && (
              <tr><td colSpan={5} className="px-5 py-16 text-center text-gray-400 text-sm">
                {search ? `Không tìm thấy "${search}"` : 'Không có câu hỏi'}
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
