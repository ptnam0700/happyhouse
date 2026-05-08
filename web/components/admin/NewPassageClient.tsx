'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Pencil, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AudioUpload } from './AudioUpload'
import { QuestionForm, type QuestionData } from './QuestionForm'
import { createPassageWithQuestions } from '@/app/admin/passages/actions'
import { cn } from '@/lib/utils'

interface Props {
  type: 'reading' | 'listening'
}

const LEVELS = ['A1','A2','B1','B2','C1','C2']

const TYPE_BADGE: Record<string, string> = {
  multiple_choice: 'bg-blue-100 text-blue-700',
  true_false:      'bg-emerald-100 text-emerald-700',
  fill_blank:      'bg-purple-100 text-purple-700',
}
const TYPE_SHORT: Record<string, string> = {
  multiple_choice: 'MC', true_false: 'T/F', fill_blank: 'Fill',
}

// Questions in-memory before the passage is saved
interface PendingQuestion extends QuestionData {
  _key: string
}

export function NewPassageClient({ type }: Props) {
  const router = useRouter()

  // Passage fields
  const [title, setTitle]           = useState('')
  const [level, setLevel]           = useState('B1')
  const [content, setContent]       = useState('')
  const [audioUrl, setAudioUrl]     = useState('')
  const [transcript, setTranscript] = useState('')

  // Questions held in state
  const [questions, setQuestions]   = useState<PendingQuestion[]>([])
  const [addingQ, setAddingQ]       = useState(false)
  const [editingKey, setEditingKey] = useState<string | null>(null)

  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState('')

  const handleAddQuestion = async (data: QuestionData) => {
    setQuestions(prev => [...prev, { ...data, _key: `q_${Date.now()}_${Math.random()}` }])
    setAddingQ(false)
  }

  const handleEditQuestion = async (data: QuestionData, key: string) => {
    setQuestions(prev => prev.map(q => q._key === key ? { ...data, _key: key } : q))
    setEditingKey(null)
  }

  const handleDeleteQuestion = (key: string) => {
    if (!confirm('Xoá câu hỏi này?')) return
    setQuestions(prev => prev.filter(q => q._key !== key))
  }

  const handleSave = async () => {
    if (!title.trim() && !content.trim() && !audioUrl.trim()) {
      setError('Vui lòng nhập ít nhất tiêu đề hoặc nội dung')
      return
    }
    setError('')
    setSaving(true)
    try {
      const { id } = await createPassageWithQuestions(
        { type, title, level, content, audio_url: audioUrl, transcript },
        questions.map(({ _key, ...q }) => q),
      )
      router.push(`/admin/passages/${id}`)
    } catch (e: any) {
      setError(e.message ?? 'Lỗi tạo bài')
      setSaving(false)
    }
  }

  const isReading   = type === 'reading'
  const isListening = type === 'listening'

  return (
    <div className="p-4 sm:p-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <Link href="/admin/passages" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#1A2744] transition-colors">
          <ChevronLeft size={16} /> Danh sách bài
        </Link>
        <div className="flex items-center gap-3 ml-auto">
          {error && <span className="text-sm text-red-500">{error}</span>}
          <Button onClick={handleSave} disabled={saving}
            className="h-9 px-6 rounded-xl bg-[#E8303A] hover:bg-[#C0222B] text-white border-0 text-sm font-bold">
            {saving ? 'Đang tạo...' : 'Tạo bài →'}
          </Button>
        </div>
      </div>

      <h1 className="text-lg sm:text-xl font-bold text-[#1A2744] mb-6">
        <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full mr-2 align-middle',
          isReading ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700')}>
          {isReading ? 'Đọc hiểu' : 'Nghe hiểu'}
        </span>
        Tạo bài mới
      </h1>

      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* ── LEFT: Passage editor ─── */}
        <div className="w-full lg:w-[400px] shrink-0 space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(26,39,68,0.08)] space-y-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Thông tin bài</h2>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">Tiêu đề</label>
              <Input value={title} onChange={e => setTitle(e.target.value)}
                placeholder="Tiêu đề bài..."
                className="h-10 border-gray-200 rounded-xl focus-visible:border-[#E8303A] focus-visible:ring-0" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">Cấp độ</label>
              <select value={level} onChange={e => setLevel(e.target.value)}
                className="w-full h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-[#1A2744] focus:outline-none focus:border-[#E8303A]">
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          {isReading && (
            <div className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(26,39,68,0.08)] space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Nội dung bài đọc</label>
              <textarea value={content} onChange={e => setContent(e.target.value)}
                rows={18} placeholder="Dán nội dung bài đọc vào đây..."
                className="w-full rounded-xl border border-gray-200 px-3.5 py-3 text-sm text-[#1A2744] leading-relaxed resize-y focus:outline-none focus:border-[#E8303A]" />
            </div>
          )}

          {isListening && (
            <div className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(26,39,68,0.08)] space-y-4">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Audio</h2>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500">URL audio</label>
                <Input value={audioUrl} onChange={e => setAudioUrl(e.target.value)}
                  placeholder="https://... hoặc tải lên bên dưới"
                  className="h-10 border-gray-200 rounded-xl focus-visible:border-[#E8303A] focus-visible:ring-0 text-sm" />
                <AudioUpload onUploaded={url => setAudioUrl(url)} />
              </div>

              {audioUrl && <audio controls src={audioUrl} className="w-full rounded-xl" />}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Transcript (tuỳ chọn)</label>
                <textarea value={transcript} onChange={e => setTranscript(e.target.value)}
                  rows={5} placeholder="Nội dung lời thoại audio..."
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-3 text-sm text-[#1A2744] leading-relaxed resize-y focus:outline-none focus:border-[#E8303A]" />
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Questions ─── */}
        <div className="flex-1 min-w-0 w-full">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-[#1A2744]">
              Câu hỏi <span className="text-gray-400 font-normal">({questions.length})</span>
              <span className="ml-2 text-xs text-gray-400 font-normal">— sẽ được lưu khi bấm Tạo bài</span>
            </h2>
            {!addingQ && (
              <Button onClick={() => { setAddingQ(true); setEditingKey(null) }}
                className="h-8 px-3.5 rounded-xl bg-[#E8303A] hover:bg-[#C0222B] text-white border-0 text-xs gap-1">
                <Plus size={14} /> Thêm câu hỏi
              </Button>
            )}
          </div>

          {addingQ && (
            <div className="mb-4">
              <QuestionForm
                defaultSection={isReading ? 'reading' : 'listening'}
                onSave={handleAddQuestion}
                onCancel={() => setAddingQ(false)}
              />
            </div>
          )}

          <div className="space-y-3">
            {questions.map((q, i) => (
              <div key={q._key} className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_2px_8px_rgba(26,39,68,0.08)]">
                {editingKey === q._key ? (
                  <QuestionForm
                    initial={q}
                    onSave={data => handleEditQuestion(data, q._key)}
                    onCancel={() => setEditingKey(null)}
                  />
                ) : (
                  <div className="flex items-start gap-3">
                    <span className="text-xs text-gray-300 font-mono shrink-0 mt-0.5 w-5">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className={cn('text-[0.65rem] font-bold px-2 py-0.5 rounded-full', TYPE_BADGE[q.type] ?? TYPE_BADGE.multiple_choice)}>
                          {TYPE_SHORT[q.type] ?? 'MC'}
                        </span>
                        <span className="text-[0.65rem] text-gray-400 font-medium">{q.level}</span>
                      </div>
                      <p className="text-sm text-[#1A2744] leading-snug mb-2">{q.question_text}</p>

                      {q.type === 'multiple_choice' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                          {(['A','B','C','D'] as const).map(letter => {
                            const val = q[`option_${letter.toLowerCase()}` as keyof QuestionData]
                            if (!val) return null
                            return (
                              <div key={letter} className={cn('text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5',
                                q.correct_answer === letter ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'bg-gray-50 text-gray-500')}>
                                <span className={cn('w-4 h-4 rounded-full flex items-center justify-center text-[0.6rem] font-bold shrink-0',
                                  q.correct_answer === letter ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400')}>
                                  {letter}
                                </span>
                                {val}
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {q.type === 'true_false' && (
                        <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-lg',
                          q.correct_answer === 'A' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600')}>
                          {q.correct_answer === 'A' ? '✓ True' : '✗ False'}
                        </span>
                      )}

                      {q.type === 'fill_blank' && (
                        <span className="text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-lg font-medium">
                          Đáp án: &quot;{q.fill_answer}&quot;
                        </span>
                      )}
                    </div>

                    <div className="flex gap-1.5 shrink-0">
                      <button onClick={() => { setEditingKey(q._key); setAddingQ(false) }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-[#1A2744] hover:bg-gray-100 transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDeleteQuestion(q._key)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {questions.length === 0 && !addingQ && (
              <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-2xl shadow-[0_2px_8px_rgba(26,39,68,0.08)]">
                Chưa có câu hỏi. Bạn có thể thêm câu hỏi trước khi lưu, hoặc thêm sau.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
