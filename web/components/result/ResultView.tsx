'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, XCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SECTION_NAMES } from '@/lib/test-utils'
import { MULTIPLE_CHOICE_TYPES } from '@/types'
import type { TestResult, Question, Answers } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  studentName: string
  studentPhone: string
  result: TestResult
  questions: Question[]
  answers: Answers
  onRetry: () => void
  onContact: () => void
}

const LETTERS = ['A', 'B', 'C', 'D']

function WrongQuestionCard({ question, studentAnswer, correctAnswer, fillAnswer, index }: {
  question: Question
  studentAnswer: string | undefined
  correctAnswer: string | null
  fillAnswer: string | null
  index: number
}) {
  const isFill = question.type === 'fill_blank'
  const isTF   = question.type === 'true_false'
  const isMC   = MULTIPLE_CHOICE_TYPES.includes(question.type)

  const getOptionText = (letter: string) => {
    const i = LETTERS.indexOf(letter)
    return i >= 0 ? question.options[i] ?? letter : letter
  }

  const tfLabel = (v: string | null | undefined) =>
    v === 'A' ? 'True' : v === 'B' ? 'False' : '—'

  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(26,39,68,0.08)]">
      <div className="flex items-start gap-3 mb-3">
        <span className="text-xs text-gray-300 font-mono shrink-0 mt-0.5 w-5">{index}</span>
        <p className="text-sm text-[#1A2744] leading-snug flex-1"
          dangerouslySetInnerHTML={{ __html: question.question.replace(/__+/g,
            '<span class="inline-block min-w-[60px] border-b-2 border-[#1A2744] mx-1 align-bottom">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>') }} />
      </div>

      <div className="flex flex-col sm:flex-row gap-2 ml-8">
        {/* Student's wrong answer */}
        <div className="flex items-center gap-2 flex-1 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
          <XCircle size={14} className="text-red-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-[0.65rem] text-red-400 font-semibold uppercase tracking-wide mb-0.5">Bạn trả lời</div>
            <div className="text-sm text-red-600 font-medium truncate">
              {isFill  ? (studentAnswer || <span className="italic text-red-400">để trống</span>) :
               isTF    ? tfLabel(studentAnswer) :
               isMC    ? (studentAnswer ? `${studentAnswer}) ${getOptionText(studentAnswer)}` : '—') : '—'}
            </div>
          </div>
        </div>

        {/* Correct answer */}
        <div className="flex items-center gap-2 flex-1 bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5">
          <CheckCircle size={14} className="text-emerald-500 shrink-0" />
          <div className="min-w-0">
            <div className="text-[0.65rem] text-emerald-600 font-semibold uppercase tracking-wide mb-0.5">Đáp án đúng</div>
            <div className="text-sm text-emerald-700 font-medium truncate">
              {isFill  ? (fillAnswer ?? '—') :
               isTF    ? tfLabel(correctAnswer) :
               isMC    ? (correctAnswer ? `${correctAnswer}) ${getOptionText(correctAnswer)}` : '—') : '—'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ResultView({ studentName, studentPhone, result, questions, answers, onRetry, onContact }: Props) {
  const [showReview, setShowReview] = useState(false)
  const { sections, totalCorrect, totalQ, questionResults } = result
  const pct = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0

  // Wrong questions: cross-reference questionResults with questions list
  const wrongQuestions = questions.filter(q => {
    const qr = questionResults[q.id]
    return qr && !qr.is_correct
  })

  return (
    <div className="w-full max-w-[680px] mx-auto px-4 py-8 sm:py-12">
      {/* Score hero */}
      <div className="text-center mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-[#1A2744] mb-6">
          Kết quả của {studentName}
        </h1>

        <div className="inline-flex flex-col items-center justify-center w-44 h-44 rounded-full bg-[#1A2744] text-white mb-4">
          <span className="text-5xl font-extrabold leading-none tabular-nums">{totalCorrect}</span>
          <span className="text-sm text-white/60 mt-1">/ {totalQ} câu đúng</span>
          <span className="text-lg font-bold text-[#F5A623] mt-1">{pct}%</span>
        </div>

        <div className="flex items-center justify-center gap-6 text-sm">
          <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
            <CheckCircle size={16} /> {totalCorrect} đúng
          </span>
          <span className="flex items-center gap-1.5 text-red-500 font-semibold">
            <XCircle size={16} /> {totalQ - totalCorrect} sai
          </span>
        </div>
      </div>

      {/* Section breakdown */}
      {Object.keys(sections).length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(26,39,68,0.08)] mb-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Theo từng kỹ năng</h2>
          <div className="space-y-3">
            {Object.entries(sections).map(([key, val]) => {
              const sectionPct = val.total > 0 ? Math.round((val.correct / val.total) * 100) : 0
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-[#1A2744]">{SECTION_NAMES[key] ?? key}</span>
                    <span className="text-sm tabular-nums text-gray-500">
                      {val.correct}/{val.total}
                      <span className="text-xs text-gray-400 ml-1">({sectionPct}%)</span>
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all',
                        sectionPct >= 70 ? 'bg-emerald-500' : sectionPct >= 50 ? 'bg-yellow-400' : 'bg-red-400')}
                      style={{ width: `${sectionPct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Wrong question review */}
      {wrongQuestions.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setShowReview(v => !v)}
            className="w-full flex items-center justify-between bg-white rounded-2xl px-5 py-4 shadow-[0_2px_8px_rgba(26,39,68,0.08)] text-left hover:shadow-md transition-shadow"
          >
            <div>
              <span className="font-semibold text-[#1A2744]">Xem lại câu sai</span>
              <span className="ml-2 text-xs font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                {wrongQuestions.length} câu
              </span>
            </div>
            {showReview ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
          </button>

          {showReview && (
            <div className="space-y-3 mt-3">
              {wrongQuestions.map((q, i) => (
                <WrongQuestionCard
                  key={q.id}
                  question={q}
                  index={i + 1}
                  studentAnswer={answers[q.id]}
                  correctAnswer={questionResults[q.id]?.correct_answer ?? null}
                  fillAnswer={questionResults[q.id]?.fill_answer ?? null}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* CTA */}
      <div className="bg-[#1A2744] text-white rounded-2xl p-5 sm:p-6 mb-4">
        <h3 className="font-bold mb-1.5">Bạn muốn cải thiện điểm số?</h3>
        <p className="text-sm text-white/70 mb-4">
          Tư vấn viên HappyHouse sẽ liên hệ để tư vấn lộ trình học phù hợp.
        </p>
        <Button onClick={onContact}
          className="w-full sm:w-auto bg-[#E8303A] hover:bg-[#C0222B] text-white font-bold px-8 h-11 rounded-xl border-0">
          Đăng ký tư vấn miễn phí
        </Button>
      </div>

      <Button variant="outline" onClick={onRetry}
        className="w-full sm:w-auto border-gray-200 text-gray-400 hover:border-[#1A2744] hover:text-[#1A2744] h-11 px-8 rounded-xl">
        Làm lại bài test
      </Button>
    </div>
  )
}
