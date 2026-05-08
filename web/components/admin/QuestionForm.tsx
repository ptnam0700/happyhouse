'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface QuestionData {
  id?: string
  type: string
  level: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: string
  fill_answer: string
  section?: string
}

const EMPTY: QuestionData = {
  type: 'multiple_choice', level: 'B1',
  question_text: '', option_a: '', option_b: '', option_c: '', option_d: '',
  correct_answer: 'A', fill_answer: '',
}

const LEVELS = ['A1','A2','B1','B2','C1','C2']
const SECTIONS = [
  { value: 'grammar',    label: 'Ngữ pháp' },
  { value: 'vocabulary', label: 'Từ vựng'  },
  { value: 'reading',    label: 'Đọc hiểu' },
  { value: 'listening',  label: 'Nghe'     },
]
const TYPES = [
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'true_false',      label: 'True / False'    },
  { value: 'fill_blank',      label: 'Fill in Blank'   },
]

interface QuestionFormProps {
  initial?: Partial<QuestionData>
  showSection?: boolean
  defaultSection?: string
  onSave: (data: QuestionData) => Promise<void>
  onCancel: () => void
}

export function QuestionForm({ initial, showSection, defaultSection, onSave, onCancel }: QuestionFormProps) {
  const [data, setData] = useState<QuestionData>({ ...EMPTY, section: defaultSection ?? 'grammar', ...initial })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (key: keyof QuestionData, value: string) =>
    setData(d => ({ ...d, [key]: value }))

  const isMC   = data.type === 'multiple_choice'
  const isTF   = data.type === 'true_false'
  const isFill = data.type === 'fill_blank'

  const handleSave = async () => {
    if (!data.question_text.trim()) { setError('Vui lòng nhập câu hỏi'); return }
    if (isMC && (!data.option_a || !data.option_b)) { setError('Cần ít nhất 2 đáp án'); return }
    setError('')
    setSaving(true)
    try { await onSave(data) }
    catch (e: any) { setError(e.message ?? 'Lỗi lưu câu hỏi') }
    finally { setSaving(false) }
  }

  return (
    <div className="bg-[#F7F6F2] rounded-2xl p-5 space-y-4 border border-gray-200">
      {/* Row 1: type + level + section */}
      <div className="flex flex-wrap gap-3">
        {showSection && (
          <div className="flex flex-col gap-1 min-w-[130px]">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phần</label>
            <select value={data.section} onChange={e => set('section', e.target.value)}
              className="h-9 rounded-lg border border-gray-200 bg-white px-2.5 text-sm text-[#1A2744] focus:outline-none focus:border-[#E8303A]">
              {SECTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        )}
        <div className="flex flex-col gap-1 min-w-[160px]">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Loại câu hỏi</label>
          <select value={data.type} onChange={e => set('type', e.target.value)}
            className="h-9 rounded-lg border border-gray-200 bg-white px-2.5 text-sm text-[#1A2744] focus:outline-none focus:border-[#E8303A]">
            {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1 w-24">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Cấp độ</label>
          <select value={data.level} onChange={e => set('level', e.target.value)}
            className="h-9 rounded-lg border border-gray-200 bg-white px-2.5 text-sm text-[#1A2744] focus:outline-none focus:border-[#E8303A]">
            {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      {/* Question text */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Câu hỏi {isFill && <span className="text-purple-500 normal-case font-normal">(dùng ___ cho chỗ trống)</span>}
        </label>
        <textarea
          value={data.question_text}
          onChange={e => set('question_text', e.target.value)}
          rows={2}
          placeholder={isFill ? 'The material changes color when ___ increases.' : 'Nhập câu hỏi...'}
          className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-[#1A2744] resize-none focus:outline-none focus:border-[#E8303A]"
        />
      </div>

      {/* MC options */}
      {isMC && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {(['A','B','C','D'] as const).map(letter => (
            <div key={letter} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => set('correct_answer', letter)}
                className={cn(
                  'w-7 h-7 rounded-full text-xs font-bold shrink-0 border-2 transition-all',
                  data.correct_answer === letter
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-gray-300 text-gray-400 hover:border-emerald-400'
                )}
              >
                {letter}
              </button>
              <Input
                value={(data as any)[`option_${letter.toLowerCase()}`]}
                onChange={e => set(`option_${letter.toLowerCase()}` as any, e.target.value)}
                placeholder={`Đáp án ${letter}`}
                className="h-9 text-sm border-gray-200 rounded-xl focus-visible:border-[#E8303A] focus-visible:ring-0"
              />
            </div>
          ))}
        </div>
      )}

      {/* True/False */}
      {isTF && (
        <div className="flex gap-3">
          {[{ value: 'A', label: '✓ True' }, { value: 'B', label: '✗ False' }].map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set('correct_answer', opt.value)}
              className={cn(
                'flex-1 h-10 rounded-xl font-semibold text-sm border-2 transition-all',
                data.correct_answer === opt.value
                  ? opt.value === 'A' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-red-50 border-[#E8303A] text-[#E8303A]'
                  : 'border-gray-200 text-gray-400 hover:border-gray-300'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Fill in blank */}
      {isFill && (
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Đáp án đúng</label>
          <Input
            value={data.fill_answer}
            onChange={e => set('fill_answer', e.target.value)}
            placeholder="Nhập đáp án chính xác..."
            className="h-9 text-sm border-gray-200 rounded-xl focus-visible:border-[#E8303A] focus-visible:ring-0"
          />
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex gap-2 justify-end pt-1">
        <Button variant="outline" onClick={onCancel} disabled={saving}
          className="h-9 px-4 rounded-xl border-gray-200 text-sm">
          Huỷ
        </Button>
        <Button onClick={handleSave} disabled={saving}
          className="h-9 px-5 rounded-xl bg-[#E8303A] hover:bg-[#C0222B] text-white border-0 text-sm">
          {saving ? 'Đang lưu...' : (initial?.id ? 'Cập nhật' : 'Thêm câu hỏi')}
        </Button>
      </div>
    </div>
  )
}
