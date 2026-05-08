'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Globe, Trash2, Search, Plus, X, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createTestWithQuestions } from '@/app/admin/tests/actions'

interface AllQuestion {
  id: string; section: string; type: string; level: string | null; question_text: string
  passage_id: string | null; passage_title: string | null; passage_type: string | null
}

interface Props { allQuestions: AllQuestion[] }

const SECTION_LABEL: Record<string, { label: string; color: string }> = {
  grammar:    { label: 'Ngữ pháp', color: 'bg-purple-100 text-purple-700' },
  vocabulary: { label: 'Từ vựng',  color: 'bg-blue-100 text-blue-700'    },
  reading:    { label: 'Đọc hiểu', color: 'bg-emerald-100 text-emerald-700' },
  listening:  { label: 'Nghe',     color: 'bg-orange-100 text-orange-700' },
}
const TYPE_SHORT: Record<string, string> = {
  multiple_choice: 'MC', fill_blank: 'Fill', true_false: 'T/F',
  reading: 'MC', listening: 'MC',
}
const TIME_PRESETS = [
  { label: '30 phút', value: 1800 },
  { label: '45 phút', value: 2700 },
  { label: '60 phút', value: 3600 },
  { label: '90 phút', value: 5400 },
]

export function NewTestClient({ allQuestions }: Props) {
  const router = useRouter()

  // Test settings
  const [name,      setName]      = useState('')
  const [desc,      setDesc]      = useState('')
  const [timeLimit, setTimeLimit] = useState(5400)

  // Selected questions (ordered list of IDs)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Picker state
  const [pickerOpen,    setPickerOpen]    = useState(false)
  const [pickerSearch,  setPickerSearch]  = useState('')
  const [pickerSection, setPickerSection] = useState('all')
  const [pickerChecked, setPickerChecked] = useState<Set<string>>(new Set())

  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  const addedSet = new Set(selectedIds)

  // Build picker groups
  const pickerAvailable = allQuestions.filter(q => {
    if (addedSet.has(q.id)) return false
    if (pickerSection !== 'all') {
      if (pickerSection === 'standalone' && q.passage_id) return false
      if (pickerSection !== 'standalone' && q.section !== pickerSection) return false
    }
    const term = pickerSearch.trim().toLowerCase()
    return !term || q.question_text.toLowerCase().includes(term) ||
      (q.passage_title ?? '').toLowerCase().includes(term)
  })

  const passageGroupMap: Record<string, AllQuestion[]> = {}
  const standaloneQs: AllQuestion[] = []
  pickerAvailable.forEach(q => {
    if (q.passage_id) {
      if (!passageGroupMap[q.passage_id]) passageGroupMap[q.passage_id] = []
      passageGroupMap[q.passage_id].push(q)
    } else {
      standaloneQs.push(q)
    }
  })

  const togglePicker = (id: string) =>
    setPickerChecked(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })

  const togglePickerGroup = (ids: string[]) =>
    setPickerChecked(prev => {
      const s = new Set(prev)
      const all = ids.every(id => s.has(id))
      ids.forEach(id => all ? s.delete(id) : s.add(id))
      return s
    })

  const addChecked = () => {
    const toAdd = Array.from(pickerChecked)
    setSelectedIds(prev => [...prev, ...toAdd])
    setPickerChecked(new Set())
    setPickerOpen(false)
  }

  const removeQuestion = (id: string) =>
    setSelectedIds(prev => prev.filter(x => x !== id))

  const selectedQuestions = selectedIds
    .map(id => allQuestions.find(q => q.id === id))
    .filter(Boolean) as AllQuestion[]

  const handleSave = async (publish = false) => {
    if (!name.trim()) { setError('Vui lòng nhập tên bài test'); return }
    setError(''); setSaving(true)
    try {
      const { id } = await createTestWithQuestions(
        { name, description: desc, time_limit_sec: timeLimit, published: publish },
        selectedIds,
      )
      router.push(`/admin/tests/${id}`)
    } catch (e: any) {
      setError(e.message ?? 'Lỗi tạo bài test')
      setSaving(false)
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <Link href="/admin/tests" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#1A2744] transition-colors">
          <ChevronLeft size={16} /> Danh sách
        </Link>
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          {error && <span className="text-sm text-red-500">{error}</span>}
          <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}
            className="h-9 px-5 rounded-xl border-gray-200 text-[#1A2744] text-sm font-semibold">
            {saving ? 'Đang lưu...' : 'Lưu nháp'}
          </Button>
          <Button onClick={() => handleSave(true)} disabled={saving}
            className="h-9 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white border-0 text-sm font-bold">
            <Globe size={14} className="mr-1.5" />
            {saving ? 'Đang tạo...' : 'Lưu & Publish'}
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* ── LEFT: Settings ── */}
        <div className="w-full lg:w-80 shrink-0 space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(26,39,68,0.08)] space-y-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Thông tin bài test</h2>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">Tên bài test *</label>
              <Input value={name} onChange={e => setName(e.target.value)}
                placeholder="VD: IELTS Entry Test — Tháng 6/2025"
                className="h-10 border-gray-200 rounded-xl focus-visible:border-[#E8303A] focus-visible:ring-0" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">Mô tả (tuỳ chọn)</label>
              <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3}
                placeholder="Mô tả ngắn về bài test..."
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-[#1A2744] resize-none focus:outline-none focus:border-[#E8303A]" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500">Thời gian làm bài</label>
              <div className="grid grid-cols-2 gap-2">
                {TIME_PRESETS.map(p => (
                  <button key={p.value} type="button" onClick={() => setTimeLimit(p.value)}
                    className={cn('py-2 rounded-xl border-2 text-xs font-semibold transition-all',
                      timeLimit === p.value
                        ? 'border-[#E8303A] bg-red-50 text-[#E8303A]'
                        : 'border-gray-200 text-gray-400 hover:border-gray-300')}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl px-5 py-4 text-xs text-gray-400 space-y-1">
            <p><strong className="text-[#1A2744]">{selectedIds.length}</strong> câu hỏi được chọn</p>
            <p><strong className="text-[#1A2744]">{Math.round(timeLimit / 60)}</strong> phút</p>
            <p className="pt-1 text-gray-300">Bài test chưa được lưu. Bấm <strong className="text-gray-400">Lưu nháp</strong> hoặc <strong className="text-gray-400">Lưu & Publish</strong> để tạo.</p>
          </div>
        </div>

        {/* ── RIGHT: Questions ── */}
        <div className="flex-1 min-w-0 w-full">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-[#1A2744]">
              Câu hỏi <span className="text-gray-400 font-normal">({selectedIds.length})</span>
            </h2>
            <Button onClick={() => setPickerOpen(v => !v)}
              className="h-8 px-3.5 rounded-xl bg-[#E8303A] hover:bg-[#C0222B] text-white border-0 text-xs gap-1">
              <Plus size={14} /> Thêm câu hỏi
            </Button>
          </div>

          {/* ── Question Picker ── */}
          {pickerOpen && (
            <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(26,39,68,0.12)] mb-4 overflow-hidden border border-gray-100">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="text-sm font-bold text-[#1A2744]">Chọn câu hỏi từ ngân hàng</span>
                <button onClick={() => { setPickerOpen(false); setPickerChecked(new Set()) }}
                  className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
              </div>

              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 flex-wrap">
                {[
                  { v: 'all',        l: 'Tất cả'   },
                  { v: 'reading',    l: '📖 Đọc'   },
                  { v: 'listening',  l: '🎧 Nghe'  },
                  { v: 'standalone', l: 'Độc lập'  },
                  { v: 'grammar',    l: 'Ngữ pháp' },
                  { v: 'vocabulary', l: 'Từ vựng'  },
                ].map(s => (
                  <button key={s.v} onClick={() => setPickerSection(s.v)}
                    className={cn('text-xs font-semibold px-3 py-1.5 rounded-full transition-colors',
                      pickerSection === s.v ? 'bg-[#1A2744] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}>
                    {s.l}
                  </button>
                ))}
                <div className="relative ml-auto w-48">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={pickerSearch} onChange={e => setPickerSearch(e.target.value)}
                    placeholder="Tìm câu hỏi / bài đọc..."
                    className="w-full h-8 pl-7 pr-3 rounded-xl border border-gray-200 bg-gray-50 text-xs text-[#1A2744] placeholder:text-gray-300 focus:outline-none focus:border-[#E8303A]" />
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {Object.entries(passageGroupMap).map(([pid, qs]) => {
                  const sample = qs[0]
                  const groupIds = qs.map(q => q.id)
                  const allSel = groupIds.every(id => pickerChecked.has(id))
                  const someSel = groupIds.some(id => pickerChecked.has(id))
                  return (
                    <div key={pid} className="border-b border-gray-100">
                      <div className={cn('flex items-center gap-2 px-4 py-2.5',
                        allSel ? 'bg-red-50' : someSel ? 'bg-orange-50/50' : 'bg-gray-50/80')}>
                        <input type="checkbox" checked={allSel}
                          ref={el => { if (el) el.indeterminate = someSel && !allSel }}
                          onChange={() => togglePickerGroup(groupIds)}
                          className="accent-[#E8303A] shrink-0" />
                        <span className={cn('text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full shrink-0',
                          sample.passage_type === 'reading' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700')}>
                          {sample.passage_type === 'reading' ? '📖 Đọc' : '🎧 Nghe'}
                        </span>
                        <span className="text-xs font-semibold text-[#1A2744] truncate flex-1">
                          {sample.passage_title ?? 'Không có tiêu đề'}
                        </span>
                        <span className="text-[0.65rem] text-gray-400 shrink-0">{qs.length} câu</span>
                        <button onClick={() => togglePickerGroup(groupIds)}
                          className={cn('text-[0.65rem] font-semibold px-2 py-0.5 rounded-full shrink-0',
                            allSel ? 'bg-red-100 text-red-600' : 'bg-[#1A2744]/10 text-[#1A2744] hover:bg-[#1A2744]/20')}>
                          {allSel ? 'Bỏ chọn' : 'Chọn tất cả'}
                        </button>
                      </div>
                      {qs.map(q => (
                        <label key={q.id} className={cn('flex items-start gap-3 pl-8 pr-4 py-2 cursor-pointer border-b border-gray-50 transition-colors',
                          pickerChecked.has(q.id) ? 'bg-red-50' : 'hover:bg-gray-50')}>
                          <input type="checkbox" checked={pickerChecked.has(q.id)} onChange={() => togglePicker(q.id)}
                            className="mt-0.5 accent-[#E8303A] shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-[0.6rem] text-gray-400 mb-0.5">{TYPE_SHORT[q.type] ?? 'MC'} · {q.level}</div>
                            <p className="text-xs text-[#1A2744] line-clamp-1">{q.question_text}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )
                })}

                {standaloneQs.length > 0 && (
                  <div>
                    {Object.keys(passageGroupMap).length > 0 && (
                      <div className="px-4 py-2 bg-gray-50/80 border-b border-gray-100">
                        <span className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-wide">Câu hỏi độc lập</span>
                      </div>
                    )}
                    {standaloneQs.slice(0, 30).map(q => {
                      const sec = SECTION_LABEL[q.section]
                      return (
                        <label key={q.id} className={cn('flex items-start gap-3 px-4 py-2.5 cursor-pointer border-b border-gray-50 transition-colors',
                          pickerChecked.has(q.id) ? 'bg-red-50' : 'hover:bg-gray-50')}>
                          <input type="checkbox" checked={pickerChecked.has(q.id)} onChange={() => togglePicker(q.id)}
                            className="mt-0.5 accent-[#E8303A] shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              {sec && <span className={`text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full ${sec.color}`}>{sec.label}</span>}
                              <span className="text-[0.6rem] text-gray-400">{TYPE_SHORT[q.type] ?? 'MC'} · {q.level}</span>
                            </div>
                            <p className="text-xs text-[#1A2744] line-clamp-1">{q.question_text}</p>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                )}

                {Object.keys(passageGroupMap).length === 0 && standaloneQs.length === 0 && (
                  <p className="text-center py-8 text-xs text-gray-400">
                    Không có câu hỏi {pickerSearch && `với "${pickerSearch}"`}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
                <span className="text-xs text-gray-400">
                  {pickerChecked.size > 0 ? `Đã chọn ${pickerChecked.size} câu` : 'Chọn câu hỏi để thêm'}
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setPickerChecked(new Set())} disabled={!pickerChecked.size}
                    className="h-8 px-3 rounded-xl text-xs border-gray-200">Bỏ chọn</Button>
                  <Button onClick={addChecked} disabled={!pickerChecked.size}
                    className="h-8 px-4 rounded-xl bg-[#E8303A] hover:bg-[#C0222B] text-white border-0 text-xs">
                    Thêm {pickerChecked.size > 0 && pickerChecked.size} câu →
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Selected questions list */}
          <div className="space-y-2">
            {selectedQuestions.map((q, i) => {
              const sec = SECTION_LABEL[q.section]
              return (
                <div key={q.id} className="bg-white rounded-2xl px-4 py-3.5 shadow-[0_2px_8px_rgba(26,39,68,0.08)] flex items-start gap-3">
                  <span className="text-xs text-gray-300 font-mono shrink-0 mt-0.5 w-5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {q.passage_id ? (
                        <span className={cn('text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full',
                          q.passage_type === 'reading' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700')}>
                          {q.passage_type === 'reading' ? '📖 Đọc' : '🎧 Nghe'}
                        </span>
                      ) : sec && (
                        <span className={`text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full ${sec.color}`}>{sec.label}</span>
                      )}
                      <span className="text-[0.6rem] text-gray-400">{TYPE_SHORT[q.type] ?? 'MC'} · {q.level}</span>
                      {q.passage_title && <span className="text-[0.6rem] text-gray-400 truncate max-w-[120px]">{q.passage_title}</span>}
                    </div>
                    <p className="text-sm text-[#1A2744] line-clamp-2 leading-snug">{q.question_text}</p>
                  </div>
                  <button onClick={() => removeQuestion(q.id)}
                    className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0">
                    <Trash2 size={13} />
                  </button>
                </div>
              )
            })}

            {selectedIds.length === 0 && !pickerOpen && (
              <div className="text-center py-12 text-sm text-gray-400 bg-white rounded-2xl shadow-[0_2px_8px_rgba(26,39,68,0.08)]">
                Chưa có câu hỏi. Nhấn &quot;+ Thêm câu hỏi&quot; để chọn từ ngân hàng.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
