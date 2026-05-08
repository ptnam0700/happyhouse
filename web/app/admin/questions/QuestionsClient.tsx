'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Search, Pencil, Trash2, X } from 'lucide-react'
import { ToggleActiveButton } from './ToggleActiveButton'
import { deleteQuestionById } from './deleteAction'
import { cn } from '@/lib/utils'

interface Question {
  id: string; section: string; type: string; level: string | null
  question_text: string; active: boolean | null; passage_id: string | null
}

interface Props { questions: Question[] }

const SECTION_LABEL: Record<string, { label: string; color: string }> = {
  grammar:    { label: 'Ngữ pháp', color: 'bg-purple-100 text-purple-700' },
  vocabulary: { label: 'Từ vựng',  color: 'bg-blue-100 text-blue-700'    },
  reading:    { label: 'Đọc hiểu', color: 'bg-emerald-100 text-emerald-700' },
  listening:  { label: 'Nghe',     color: 'bg-orange-100 text-orange-700' },
}
const TYPE_LABEL: Record<string, string> = {
  multiple_choice: 'MC', fill_blank: 'Fill', true_false: 'T/F',
  reading: 'MC', listening: 'MC',
}

function DeleteButton({ id, onDeleted }: { id: string; onDeleted: () => void }) {
  const [pending, startTransition] = useTransition()
  const handle = () => {
    if (!confirm('Xoá câu hỏi này?')) return
    startTransition(async () => {
      await deleteQuestionById(id)
      onDeleted()
    })
  }
  return (
    <button onClick={handle} disabled={pending}
      className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40">
      <Trash2 size={13} />
    </button>
  )
}

export function QuestionsClient({ questions: initial }: Props) {
  const [questions, setQuestions] = useState(initial)
  const [section, setSection]     = useState('all')
  const [search, setSearch]       = useState('')

  // Counts always from full list — never affected by current filter
  const counts = {
    all:        initial.length,
    grammar:    initial.filter(q => q.section === 'grammar').length,
    vocabulary: initial.filter(q => q.section === 'vocabulary').length,
    reading:    initial.filter(q => q.section === 'reading').length,
    listening:  initial.filter(q => q.section === 'listening').length,
  }

  const filtered = questions.filter(q => {
    const matchSection = section === 'all' || q.section === section
    const term = search.trim().toLowerCase()
    const matchSearch = !term || q.question_text.toLowerCase().includes(term)
    return matchSection && matchSearch
  })

  const filters = [
    { key: 'all',        label: `Tất cả`,        count: counts.all        },
    { key: 'grammar',    label: `Ngữ pháp`,      count: counts.grammar    },
    { key: 'vocabulary', label: `Từ vựng`,       count: counts.vocabulary },
    { key: 'reading',    label: `Đọc hiểu`,      count: counts.reading    },
    { key: 'listening',  label: `Nghe`,          count: counts.listening  },
  ]

  return (
    <>
      {/* Filter + search bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex flex-wrap gap-2">
          {filters.map(f => (
            <button key={f.key} onClick={() => setSection(f.key)}
              className={cn(
                'text-xs font-semibold px-3.5 py-1.5 rounded-full transition-colors',
                section === f.key
                  ? 'bg-[#1A2744] text-white'
                  : 'bg-white text-gray-500 hover:bg-gray-100 shadow-sm'
              )}>
              {f.label}
              <span className={cn('ml-1.5 text-[0.65rem] font-bold',
                section === f.key ? 'text-white/70' : 'text-gray-400')}>
                {f.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative sm:ml-auto w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm câu hỏi..."
            className="w-full h-9 pl-8 pr-8 rounded-xl border border-gray-200 bg-white text-sm text-[#1A2744] placeholder:text-gray-300 focus:outline-none focus:border-[#E8303A]"
          />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Result count */}
      <p className="text-xs text-gray-400 mb-2.5">
        {filtered.length} / {questions.length} câu hỏi
        {search && <span className="ml-1">— kết quả cho &quot;{search}&quot;</span>}
      </p>

      <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(26,39,68,0.08)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Câu hỏi</th>
                <th className="text-left px-3 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden sm:table-cell">Phần</th>
                <th className="text-left px-3 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden md:table-cell">Loại</th>
                <th className="text-left px-3 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden md:table-cell">Cấp</th>
                <th className="text-center px-3 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((q, i) => {
                const sec = SECTION_LABEL[q.section]
                return (
                  <tr key={q.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-start gap-2.5">
                        <span className="text-xs text-gray-300 font-mono mt-0.5 shrink-0 w-6">{i + 1}</span>
                        <span className="text-[#1A2744] line-clamp-2 leading-snug">{q.question_text}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 hidden sm:table-cell">
                      {sec && (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${sec.color}`}>
                          {sec.label}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3.5 hidden md:table-cell">
                      <span className="text-xs font-mono text-gray-400">{TYPE_LABEL[q.type] ?? q.type}</span>
                    </td>
                    <td className="px-3 py-3.5 hidden md:table-cell">
                      <span className="text-xs text-gray-400">{q.level ?? '—'}</span>
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center justify-center gap-1">
                        <ToggleActiveButton id={q.id} active={q.active ?? false} />
                        <Link href={`/admin/questions/${q.id}`}
                          className="p-1.5 rounded-lg text-gray-300 hover:text-[#1A2744] hover:bg-gray-100 transition-colors">
                          <Pencil size={13} />
                        </Link>
                        <DeleteButton
                          id={q.id}
                          onDeleted={() => setQuestions(prev => prev.filter(x => x.id !== q.id))}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
              {!filtered.length && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-gray-400">
                    {search ? `Không tìm thấy câu hỏi nào với "${search}"` : 'Không có câu hỏi'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
