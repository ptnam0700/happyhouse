import { createServiceClient } from '@/lib/supabase/service'
import { ToggleActiveButton } from './ToggleActiveButton'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Câu hỏi' }

const SECTION_LABEL: Record<string, { label: string; color: string }> = {
  grammar:    { label: 'Ngữ pháp', color: 'bg-purple-100 text-purple-700' },
  vocabulary: { label: 'Từ vựng',  color: 'bg-blue-100 text-blue-700'    },
  reading:    { label: 'Đọc hiểu', color: 'bg-emerald-100 text-emerald-700' },
  listening:  { label: 'Nghe',     color: 'bg-orange-100 text-orange-700' },
}

const TYPE_LABEL: Record<string, string> = {
  multiple_choice: 'MC',
  fill_blank:      'Fill',
  true_false:      'T/F',
  reading:         'MC',
  listening:       'MC',
}

export default async function QuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>
}) {
  const { section } = await searchParams
  const db = createServiceClient()

  let query = db
    .from('questions')
    .select('id, section, type, level, question_text, active, correct_answer, passage_id')
    .order('section')
    .order('created_at', { ascending: false })

  if (section && section !== 'all') query = query.eq('section', section)

  const { data: questions } = await query

  const counts = {
    all:        questions?.length ?? 0,
    grammar:    questions?.filter(q => q.section === 'grammar').length ?? 0,
    vocabulary: questions?.filter(q => q.section === 'vocabulary').length ?? 0,
    reading:    questions?.filter(q => q.section === 'reading').length ?? 0,
    listening:  questions?.filter(q => q.section === 'listening').length ?? 0,
  }

  const filters = [
    { key: 'all',        label: `Tất cả (${counts.all})` },
    { key: 'grammar',    label: `Ngữ pháp (${counts.grammar})` },
    { key: 'vocabulary', label: `Từ vựng (${counts.vocabulary})` },
    { key: 'reading',    label: `Đọc hiểu (${counts.reading})` },
    { key: 'listening',  label: `Nghe (${counts.listening})` },
  ]

  const activeSection = section ?? 'all'

  return (
    <div className="p-4 sm:p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-[#1A2744]">Câu hỏi</h1>
        <span className="text-sm text-gray-400">{questions?.length ?? 0} câu</span>
      </div>

      {/* Section filter */}
      <div className="flex flex-wrap gap-2 mb-5">
        {filters.map(f => (
          <a
            key={f.key}
            href={f.key === 'all' ? '/admin/questions' : `/admin/questions?section=${f.key}`}
            className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-colors ${
              activeSection === f.key
                ? 'bg-[#1A2744] text-white'
                : 'bg-white text-gray-500 hover:bg-gray-100 shadow-sm'
            }`}
          >
            {f.label}
          </a>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(26,39,68,0.08)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Câu hỏi</th>
                <th className="text-left px-3 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden sm:table-cell">Phần</th>
                <th className="text-left px-3 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden md:table-cell">Loại</th>
                <th className="text-left px-3 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden md:table-cell">Cấp</th>
                <th className="text-center px-3 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Active</th>
              </tr>
            </thead>
            <tbody>
              {questions?.map((q, i) => {
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
                      <span className="text-xs font-mono text-gray-400">
                        {TYPE_LABEL[q.type] ?? q.type}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 hidden md:table-cell">
                      <span className="text-xs text-gray-400">{q.level ?? '—'}</span>
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      <ToggleActiveButton id={q.id} active={q.active ?? false} />
                    </td>
                  </tr>
                )
              })}
              {!questions?.length && (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-400">Không có câu hỏi</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
