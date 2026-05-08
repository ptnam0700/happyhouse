'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'
import { ChevronLeft, Globe, Lock, Trash2, ChevronUp, ChevronDown, Search, Plus, X, Copy, Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  updateTest, publishTest, deleteTest,
  addQuestionsToTest, removeQuestionFromTest, reorderQuestion,
} from '@/app/admin/tests/actions'

interface TestQuestion {
  question_id: string; order_index: number
  question_text: string; section: string; type: string; level: string | null
}
interface AllQuestion {
  id: string; section: string; type: string; level: string | null; question_text: string
}
interface Test {
  id: string; name: string; description: string | null
  time_limit_sec: number; published: boolean
}

interface Props {
  test: Test
  testQuestions: TestQuestion[]
  allQuestions: AllQuestion[]
  siteUrl: string
}

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
  { label: '30 min', value: 1800 },
  { label: '45 min', value: 2700 },
  { label: '60 min', value: 3600 },
  { label: '90 min', value: 5400 },
]

export function TestEditClient({ test, testQuestions: initialTQ, allQuestions, siteUrl }: Props) {
  const [name, setName]           = useState(test.name)
  const [desc, setDesc]           = useState(test.description ?? '')
  const [timeLimit, setTimeLimit] = useState(test.time_limit_sec)
  const [published, setPublished] = useState(test.published)
  const [tq, setTq]               = useState(initialTQ)
  const [copied, setCopied]       = useState(false)

  // Question picker state
  const [pickerOpen, setPickerOpen]   = useState(false)
  const [pickerSearch, setPickerSearch] = useState('')
  const [pickerSection, setPickerSection] = useState('all')
  const [selected, setSelected]       = useState<Set<string>>(new Set())

  const [, startTransition] = useTransition()

  const shareUrl = `${siteUrl}/t/${test.id}`
  const addedIds = new Set(tq.map(q => q.question_id))

  // ── Save settings ──────────────────────────────────────────────
  const handleSave = () => {
    startTransition(async () => {
      const fd = new FormData()
      fd.set('name', name); fd.set('description', desc); fd.set('time_limit_sec', String(timeLimit))
      await updateTest(test.id, fd)
      toast.success('Đã lưu bài test')
    })
  }

  // ── Publish toggle ─────────────────────────────────────────────
  const handlePublish = () => {
    const next = !published
    startTransition(async () => {
      try {
        await publishTest(test.id, next)
        setPublished(next)
        toast.success(next ? 'Đã publish — link đã sẵn sàng chia sẻ' : 'Đã ẩn bài test')
      } catch {
        toast.error('Không thể thay đổi trạng thái')
      }
    })
  }

  // ── Delete test ────────────────────────────────────────────────
  const handleDelete = () => {
    if (!confirm('Xoá bài test này? Dữ liệu bài làm của học viên vẫn được giữ.')) return
    startTransition(() => deleteTest(test.id))
  }

  // ── Question picker ────────────────────────────────────────────
  const pickerFiltered = allQuestions.filter(q => {
    if (addedIds.has(q.id)) return false
    if (pickerSection !== 'all' && q.section !== pickerSection) return false
    const term = pickerSearch.trim().toLowerCase()
    return !term || q.question_text.toLowerCase().includes(term)
  })

  const toggleSelect = (id: string) =>
    setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })

  const handleAddSelected = () => {
    if (!selected.size) return
    const ids = Array.from(selected)
    const count = ids.length
    startTransition(async () => {
      try {
        await addQuestionsToTest(test.id, ids)
        const newRows = allQuestions
          .filter(q => ids.includes(q.id))
          .map((q, i) => ({ question_id: q.id, order_index: tq.length + i, question_text: q.question_text, section: q.section, type: q.type, level: q.level }))
        setTq(prev => [...prev, ...newRows])
        setSelected(new Set())
        setPickerOpen(false)
        toast.success(`Đã thêm ${count} câu hỏi`)
      } catch {
        toast.error('Không thể thêm câu hỏi')
      }
    })
  }

  const handleRemove = (qid: string) => {
    startTransition(async () => {
      try {
        await removeQuestionFromTest(test.id, qid)
        setTq(prev => prev.filter(q => q.question_id !== qid))
        toast.info('Đã xoá câu hỏi khỏi bài test')
      } catch {
        toast.error('Không thể xoá câu hỏi')
      }
    })
  }

  const handleReorder = (qid: string, dir: 'up' | 'down') => {
    startTransition(async () => {
      await reorderQuestion(test.id, qid, dir)
      setTq(prev => {
        const arr = [...prev].sort((a, b) => a.order_index - b.order_index)
        const i = arr.findIndex(q => q.question_id === qid)
        const j = dir === 'up' ? i - 1 : i + 1
        if (j < 0 || j >= arr.length) return prev
        ;[arr[i].order_index, arr[j].order_index] = [arr[j].order_index, arr[i].order_index]
        return arr.sort((a, b) => a.order_index - b.order_index)
      })
    })
  }

  const copyUrl = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const sortedTq = [...tq].sort((a, b) => a.order_index - b.order_index)

  return (
    <div className="p-4 sm:p-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <Link href="/admin/tests" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#1A2744] transition-colors">
          <ChevronLeft size={16} /> Danh sách
        </Link>
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <Button variant="outline" onClick={handleDelete}
            className="h-9 px-4 rounded-xl border-red-200 text-red-500 hover:bg-red-50 text-sm">
            <Trash2 size={14} className="mr-1.5" /> Xoá
          </Button>
          <Button onClick={handleSave}
            className="h-9 px-5 rounded-xl bg-[#1A2744] hover:bg-[#243461] text-white border-0 text-sm">
            Lưu
          </Button>
          <Button onClick={handlePublish}
            className={cn('h-9 px-5 rounded-xl border-0 text-sm font-bold',
              published ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' : 'bg-emerald-600 hover:bg-emerald-700 text-white')}>
            {published ? <><Lock size={14} className="mr-1.5" /> Ẩn</> : <><Globe size={14} className="mr-1.5" /> Publish</>}
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* ── LEFT: Settings ── */}
        <div className="w-full lg:w-80 shrink-0 space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(26,39,68,0.08)] space-y-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Thông tin bài test</h2>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">Tên</label>
              <Input value={name} onChange={e => setName(e.target.value)}
                className="h-10 border-gray-200 rounded-xl focus-visible:border-[#E8303A] focus-visible:ring-0" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">Mô tả</label>
              <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3}
                placeholder="Mô tả bài test..."
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-[#1A2744] resize-none focus:outline-none focus:border-[#E8303A]" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500">Thời gian</label>
              <div className="grid grid-cols-2 gap-2">
                {TIME_PRESETS.map(p => (
                  <button key={p.value} type="button" onClick={() => setTimeLimit(p.value)}
                    className={cn('py-2 rounded-xl border-2 text-xs font-semibold transition-all',
                      timeLimit === p.value ? 'border-[#E8303A] bg-red-50 text-[#E8303A]' : 'border-gray-200 text-gray-400 hover:border-gray-300')}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Status + share URL */}
          <div className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(26,39,68,0.08)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Trạng thái</span>
              <span className={cn('text-xs font-bold px-2.5 py-1 rounded-full',
                published ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400')}>
                {published ? '🟢 Published' : '🔒 Draft'}
              </span>
            </div>

            {published ? (
              <div className="space-y-2">
                <p className="text-xs text-gray-400">Link chia sẻ cho học viên:</p>
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                  <span className="text-xs text-emerald-700 font-mono flex-1 truncate">{shareUrl}</span>
                  <button onClick={copyUrl} className="shrink-0 text-gray-400 hover:text-emerald-600 transition-colors">
                    {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400">Publish để tạo link chia sẻ cho học viên.</p>
            )}

            <div className="pt-1 text-xs text-gray-400">
              <strong className="text-[#1A2744]">{tq.length}</strong> câu hỏi ·{' '}
              <strong className="text-[#1A2744]">{Math.round(timeLimit / 60)}</strong> phút
            </div>
          </div>
        </div>

        {/* ── RIGHT: Question list ── */}
        <div className="flex-1 min-w-0 w-full">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-[#1A2744]">
              Câu hỏi <span className="text-gray-400 font-normal">({tq.length})</span>
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
                <button onClick={() => { setPickerOpen(false); setSelected(new Set()) }}
                  className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
              </div>

              {/* Picker filters */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 flex-wrap">
                {['all','grammar','vocabulary','reading','listening'].map(s => (
                  <button key={s} onClick={() => setPickerSection(s)}
                    className={cn('text-xs font-semibold px-3 py-1.5 rounded-full transition-colors',
                      pickerSection === s ? 'bg-[#1A2744] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}>
                    {s === 'all' ? 'Tất cả' : SECTION_LABEL[s]?.label ?? s}
                  </button>
                ))}
                <div className="relative ml-auto w-48">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={pickerSearch} onChange={e => setPickerSearch(e.target.value)}
                    placeholder="Tìm câu hỏi..."
                    className="w-full h-8 pl-7 pr-3 rounded-xl border border-gray-200 bg-gray-50 text-xs text-[#1A2744] placeholder:text-gray-300 focus:outline-none focus:border-[#E8303A]" />
                </div>
              </div>

              {/* Picker list */}
              <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                {pickerFiltered.slice(0, 50).map(q => {
                  const sec = SECTION_LABEL[q.section]
                  const isSelected = selected.has(q.id)
                  return (
                    <label key={q.id} className={cn('flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors',
                      isSelected ? 'bg-red-50' : 'hover:bg-gray-50')}>
                      <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(q.id)}
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
                {pickerFiltered.length === 0 && (
                  <p className="text-center py-8 text-xs text-gray-400">Không có câu hỏi nào {pickerSearch && `với "${pickerSearch}"`}</p>
                )}
              </div>

              {/* Picker footer */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
                <span className="text-xs text-gray-400">
                  {selected.size > 0 ? `Đã chọn ${selected.size} câu` : 'Chọn câu hỏi để thêm'}
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setSelected(new Set())}
                    className="h-8 px-3 rounded-xl text-xs border-gray-200" disabled={!selected.size}>
                    Bỏ chọn
                  </Button>
                  <Button onClick={handleAddSelected} disabled={!selected.size}
                    className="h-8 px-4 rounded-xl bg-[#E8303A] hover:bg-[#C0222B] text-white border-0 text-xs">
                    Thêm {selected.size > 0 && selected.size} câu →
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ── Questions in test ── */}
          <div className="space-y-2">
            {sortedTq.map((q, i) => {
              const sec = SECTION_LABEL[q.section]
              return (
                <div key={q.question_id} className="bg-white rounded-2xl px-4 py-3.5 shadow-[0_2px_8px_rgba(26,39,68,0.08)] flex items-start gap-3">
                  <span className="text-xs text-gray-300 font-mono shrink-0 mt-0.5 w-5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {sec && <span className={`text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full ${sec.color}`}>{sec.label}</span>}
                      <span className="text-[0.6rem] text-gray-400">{TYPE_SHORT[q.type] ?? 'MC'} · {q.level}</span>
                    </div>
                    <p className="text-sm text-[#1A2744] line-clamp-2 leading-snug">{q.question_text}</p>
                  </div>
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button onClick={() => handleReorder(q.question_id, 'up')} disabled={i === 0}
                      className="p-1 rounded text-gray-300 hover:text-[#1A2744] hover:bg-gray-100 disabled:opacity-20 transition-colors">
                      <ChevronUp size={13} />
                    </button>
                    <button onClick={() => handleReorder(q.question_id, 'down')} disabled={i === sortedTq.length - 1}
                      className="p-1 rounded text-gray-300 hover:text-[#1A2744] hover:bg-gray-100 disabled:opacity-20 transition-colors">
                      <ChevronDown size={13} />
                    </button>
                  </div>
                  <button onClick={() => handleRemove(q.question_id)}
                    className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0">
                    <Trash2 size={13} />
                  </button>
                </div>
              )
            })}
            {sortedTq.length === 0 && !pickerOpen && (
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
