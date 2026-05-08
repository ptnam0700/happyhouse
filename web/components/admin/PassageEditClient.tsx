'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Pencil, Trash2, Plus, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AudioUpload } from './AudioUpload'
import { QuestionForm, type QuestionData } from './QuestionForm'
import { updatePassage, deletePassage, createQuestion, updateQuestion, deleteQuestion } from '@/app/admin/passages/actions'
import { cn } from '@/lib/utils'

interface Question {
  id: string; section: string; type: string; level: string; question_text: string
  option_a: string|null; option_b: string|null; option_c: string|null; option_d: string|null
  correct_answer: string|null; fill_answer: string|null; active: boolean
}

interface Passage {
  id: string; title: string|null; type: 'reading'|'listening'; level: string
  content: string|null; audio_url: string|null; transcript: string|null; active: boolean
}

interface Props { passage: Passage; questions: Question[] }

const LEVELS = ['A1','A2','B1','B2','C1','C2']

const TYPE_BADGE: Record<string, string> = {
  multiple_choice: 'bg-blue-100 text-blue-700',
  true_false:      'bg-emerald-100 text-emerald-700',
  fill_blank:      'bg-purple-100 text-purple-700',
}
const TYPE_SHORT: Record<string, string> = {
  multiple_choice: 'MC', true_false: 'T/F', fill_blank: 'Fill',
  reading: 'MC', listening: 'MC',
}

export function PassageEditClient({ passage, questions: initialQuestions }: Props) {
  // Passage form state
  const [title, setTitle]       = useState(passage.title ?? '')
  const [level, setLevel]       = useState(passage.level)
  const [content, setContent]   = useState(passage.content ?? '')
  const [audioUrl, setAudioUrl] = useState(passage.audio_url ?? '')
  const [transcript, setTranscript] = useState(passage.transcript ?? '')
  const [active, setActive]     = useState(passage.active)
  // saveMsg removed — using toast instead

  // Questions state
  const [questions, setQuestions]     = useState<Question[]>(initialQuestions)
  const [addingQuestion, setAdding]   = useState(false)
  const [editingId, setEditingId]     = useState<string|null>(null)

  const [pending, startTransition] = useTransition()

  // ── Save passage ────────────────────────────────────────────────
  const handleSave = () => {
    startTransition(async () => {
      const fd = new FormData()
      fd.set('type', passage.type)
      fd.set('title', title)
      fd.set('level', level)
      fd.set('active', String(active))
      if (passage.type === 'reading') { fd.set('content', content) }
      else { fd.set('audio_url', audioUrl); fd.set('transcript', transcript) }

      try {
        await updatePassage(passage.id, fd)
        toast.success('Đã lưu bài thành công')
      } catch (e: any) { toast.error('Lỗi: ' + e.message) }
    })
  }

  const handleDelete = () => {
    if (!confirm('Xoá bài này? Các câu hỏi liên kết sẽ không bị xoá.')) return
    startTransition(() => deletePassage(passage.id))
  }

  // ── Save question ───────────────────────────────────────────────
  const handleSaveQuestion = async (data: QuestionData, existingId?: string) => {
    const fd = new FormData()
    Object.entries(data).forEach(([k, v]) => fd.set(k, v ?? ''))

    try {
      if (existingId) {
        await updateQuestion(existingId, passage.id, fd)
        setQuestions(prev => prev.map(q => q.id === existingId ? {
          ...q, ...data,
          option_a: data.option_a || null, option_b: data.option_b || null,
          option_c: data.option_c || null, option_d: data.option_d || null,
          correct_answer: data.type !== 'fill_blank' ? data.correct_answer || null : null,
          fill_answer: data.type === 'fill_blank' ? data.fill_answer || null : null,
        } : q))
        setEditingId(null)
        toast.success('Đã cập nhật câu hỏi')
      } else {
        await createQuestion(passage.id, passage.type === 'reading' ? 'reading' : 'listening', fd)
        toast.success('Đã thêm câu hỏi')
        window.location.reload()
      }
    } catch (e: any) {
      toast.error('Lỗi: ' + e.message)
    }
  }

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Xoá câu hỏi này?')) return
    try {
      await deleteQuestion(id, passage.id)
      setQuestions(prev => prev.filter(q => q.id !== id))
      toast.info('Đã xoá câu hỏi')
    } catch (e: any) {
      toast.error('Lỗi: ' + e.message)
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <Link href="/admin/passages" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#1A2744] transition-colors">
          <ChevronLeft size={16} /> Danh sách bài
        </Link>
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="outline" onClick={handleDelete} disabled={pending}
            className="h-9 px-4 rounded-xl border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 text-sm">
            <Trash2 size={15} className="mr-1.5" /> Xoá
          </Button>
          <Button onClick={handleSave} disabled={pending}
            className="h-9 px-5 rounded-xl bg-[#1A2744] hover:bg-[#243461] text-white border-0 text-sm">
            {pending ? 'Đang lưu...' : 'Lưu bài'}
          </Button>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-lg sm:text-xl font-bold text-[#1A2744] mb-6">
        <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full mr-2 align-middle',
          passage.type === 'reading' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700')}>
          {passage.type === 'reading' ? 'Đọc hiểu' : 'Nghe hiểu'}
        </span>
        {title || 'Chưa có tiêu đề'}
      </h1>

      {/* Split layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* ── LEFT: Passage editor ─────────────────────── */}
        <div className="w-full lg:w-[400px] shrink-0 space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(26,39,68,0.08)] space-y-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Thông tin bài</h2>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">Tiêu đề</label>
              <Input value={title} onChange={e => setTitle(e.target.value)}
                placeholder="Tiêu đề bài..."
                className="h-10 border-gray-200 rounded-xl focus-visible:border-[#E8303A] focus-visible:ring-0" />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 space-y-1">
                <label className="text-xs font-semibold text-gray-500">Cấp độ</label>
                <select value={level} onChange={e => setLevel(e.target.value)}
                  className="w-full h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-[#1A2744] focus:outline-none focus:border-[#E8303A]">
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Hiển thị</label>
                <button type="button" onClick={() => setActive(v => !v)}
                  className={cn('flex items-center gap-2 h-10 px-3 rounded-xl text-sm font-medium border transition-colors',
                    active ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-400')}>
                  <span className={cn('w-2 h-2 rounded-full', active ? 'bg-emerald-500' : 'bg-gray-300')} />
                  {active ? 'Active' : 'Ẩn'}
                </button>
              </div>
            </div>
          </div>

          {/* Reading: content */}
          {passage.type === 'reading' && (
            <div className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(26,39,68,0.08)] space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Nội dung bài đọc</label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={16}
                placeholder="Dán nội dung bài đọc vào đây..."
                className="w-full rounded-xl border border-gray-200 px-3.5 py-3 text-sm text-[#1A2744] leading-relaxed resize-y focus:outline-none focus:border-[#E8303A]"
              />
            </div>
          )}

          {/* Listening: audio */}
          {passage.type === 'listening' && (
            <div className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(26,39,68,0.08)] space-y-4">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Audio</h2>

              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <label className="text-xs font-semibold text-gray-500 w-full">URL audio</label>
                  <Input value={audioUrl} onChange={e => setAudioUrl(e.target.value)}
                    placeholder="https://... hoặc tải lên bên dưới"
                    className="h-10 border-gray-200 rounded-xl focus-visible:border-[#E8303A] focus-visible:ring-0 text-sm" />
                </div>
                <AudioUpload onUploaded={url => setAudioUrl(url)} />
              </div>

              {audioUrl && (
                <audio controls src={audioUrl} className="w-full rounded-xl mt-1" />
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Transcript (tuỳ chọn)</label>
                <textarea value={transcript} onChange={e => setTranscript(e.target.value)}
                  rows={6} placeholder="Nội dung lời thoại audio..."
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-3 text-sm text-[#1A2744] leading-relaxed resize-y focus:outline-none focus:border-[#E8303A]" />
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Questions ──────────────────────────── */}
        <div className="flex-1 min-w-0 w-full">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-[#1A2744]">
              Câu hỏi <span className="text-gray-400 font-normal">({questions.length})</span>
            </h2>
            {!addingQuestion && (
              <Button onClick={() => { setAdding(true); setEditingId(null) }}
                className="h-8 px-3.5 rounded-xl bg-[#E8303A] hover:bg-[#C0222B] text-white border-0 text-xs gap-1">
                <Plus size={14} /> Thêm câu hỏi
              </Button>
            )}
          </div>

          {/* Add form */}
          {addingQuestion && (
            <div className="mb-4">
              <QuestionForm
                defaultSection={passage.type === 'reading' ? 'reading' : 'listening'}
                onSave={data => handleSaveQuestion(data)}
                onCancel={() => setAdding(false)}
              />
            </div>
          )}

          {/* Question list */}
          <div className="space-y-3">
            {questions.map((q, i) => (
              <div key={q.id} className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_2px_8px_rgba(26,39,68,0.08)]">
                {editingId === q.id ? (
                  <QuestionForm
                    initial={{
                      id: q.id, type: q.type, level: q.level, question_text: q.question_text,
                      option_a: q.option_a ?? '', option_b: q.option_b ?? '',
                      option_c: q.option_c ?? '', option_d: q.option_d ?? '',
                      correct_answer: q.correct_answer ?? 'A', fill_answer: q.fill_answer ?? '',
                    }}
                    onSave={data => handleSaveQuestion(data, q.id)}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <>
                    <div className="flex items-start gap-3">
                      <span className="text-xs text-gray-300 font-mono shrink-0 mt-0.5 w-5">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className={cn('text-[0.65rem] font-bold px-2 py-0.5 rounded-full', TYPE_BADGE[q.type] ?? TYPE_BADGE.multiple_choice)}>
                            {TYPE_SHORT[q.type] ?? 'MC'}
                          </span>
                          <span className="text-[0.65rem] text-gray-400 font-medium">{q.level}</span>
                          {!q.active && <span className="text-[0.65rem] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full">Ẩn</span>}
                        </div>
                        <p className="text-sm text-[#1A2744] leading-snug mb-2">{q.question_text}</p>

                        {/* MC options preview */}
                        {(q.type === 'multiple_choice' || q.type === 'reading' || q.type === 'listening') && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                            {[['A', q.option_a], ['B', q.option_b], ['C', q.option_c], ['D', q.option_d]].filter(([, v]) => v).map(([letter, val]) => (
                              <div key={letter} className={cn('text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5',
                                q.correct_answer === letter ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'bg-gray-50 text-gray-500')}>
                                <span className={cn('w-4 h-4 rounded-full flex items-center justify-center text-[0.6rem] font-bold shrink-0',
                                  q.correct_answer === letter ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400')}>
                                  {letter}
                                </span>
                                {val}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* T/F answer */}
                        {q.type === 'true_false' && (
                          <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-lg',
                            q.correct_answer === 'A' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600')}>
                            {q.correct_answer === 'A' ? '✓ True' : '✗ False'}
                          </span>
                        )}

                        {/* Fill answer */}
                        {q.type === 'fill_blank' && (
                          <span className="text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-lg font-medium">
                            Đáp án: &quot;{q.fill_answer}&quot;
                          </span>
                        )}
                      </div>

                      <div className="flex gap-1.5 shrink-0">
                        <button onClick={() => { setEditingId(q.id); setAdding(false) }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-[#1A2744] hover:bg-gray-100 transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDeleteQuestion(q.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}

            {questions.length === 0 && !addingQuestion && (
              <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-2xl shadow-[0_2px_8px_rgba(26,39,68,0.08)]">
                Chưa có câu hỏi nào. Nhấn &quot;+ Thêm câu hỏi&quot; để bắt đầu.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
