'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { LoadingOverlay } from '@/components/layout/LoadingOverlay'
import { QuestionNavigator } from '@/components/test/QuestionNavigator'
import { QuestionCard } from '@/components/test/QuestionCard'
import { ReadingPanel } from '@/components/test/ReadingPanel'
import { ListeningPanel } from '@/components/test/ListeningPanel'
import { ResultView } from '@/components/result/ResultView'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { getGroupStart, getGroupEnd, mapServerScores, subgroupInstruction } from '@/lib/test-utils'
import type { Question, Answers, TestResult } from '@/types'

interface Props {
  testId: string; testName: string; testDesc: string | null
  timeLimitSec: number; questions: Question[]
  studentId: string; studentName: string; studentPhone: string
}

export function PortalTestClient({ testId, testName, testDesc, timeLimitSec, questions, studentId, studentName, studentPhone }: Props) {
  const router = useRouter()
  const [phase, setPhase]       = useState<'test' | 'result'>('test')
  const [answers, setAnswers]   = useState<Answers>({})
  const [currentIdx, setIdx]    = useState(0)
  const [timeLeft, setTimeLeft] = useState(timeLimitSec)
  const [saving, setSaving]     = useState(false)
  const [result, setResult]     = useState<TestResult | null>(null)
  const startTimeRef            = useRef(new Date())
  const timerRef                = useRef<ReturnType<typeof setInterval> | null>(null)
  const submittingRef           = useRef(false)

  const groupStart = questions.length ? getGroupStart(questions, currentIdx) : 0
  const groupEnd   = questions.length ? getGroupEnd(questions, currentIdx)   : 0
  const currentQ   = questions[currentIdx]
  const isLast     = groupEnd >= questions.length - 1
  const isSplit    = !!currentQ?.passageId

  const setAnswer    = useCallback((qid: string, v: string) => setAnswers(p => ({ ...p, [qid]: v })), [])
  const removeAnswer = useCallback((qid: string) => setAnswers(p => { const { [qid]: _, ...r } = p; return r }), [])

  useEffect(() => {
    timerRef.current = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  const handleSubmit = useCallback(async () => {
    if (submittingRef.current) return
    submittingRef.current = true
    if (timerRef.current) clearInterval(timerRef.current)
    setSaving(true)

    const supabase = createClient()
    const duration = Math.round((Date.now() - startTimeRef.current.getTime()) / 1000)

    try {
      const { data, error } = await supabase.rpc('submit_test', {
        p_name:               studentName,
        p_phone:              studentPhone || `student_${studentId}`,
        p_email:              '',
        p_test_type:          'full',
        p_started_at:         startTimeRef.current.toISOString(),
        p_duration_sec:       duration,
        p_answers:            answers,
        p_test_id:            testId,
        p_school_student_id:  studentId,
      })
      if (error) throw error
      setResult(mapServerScores(data))
    } catch {
      setResult(mapServerScores({}))
    }
    setSaving(false)
    setPhase('result')
  }, [answers, testId, studentId, studentName, studentPhone])

  useEffect(() => {
    if (timeLeft === 0 && !submittingRef.current) handleSubmit()
  }, [timeLeft, handleSubmit])

  const confirmSubmit = useCallback(() => {
    const unanswered = questions.length - Object.keys(answers).length
    if (unanswered > 0 && !confirm(`Còn ${unanswered} câu chưa trả lời. Nộp bài?`)) return
    handleSubmit()
  }, [questions.length, answers, handleSubmit])

  const prevGroup = () => {
    if (groupStart === 0) return
    setIdx(getGroupStart(questions, groupStart - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const nextGroup = () => {
    if (isLast) { confirmSubmit(); return }
    setIdx(groupEnd + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const jumpTo = (i: number) => {
    setIdx(getGroupStart(questions, i))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const renderPassageQs = () => {
    if (!currentQ?.passageId) return null
    const group = questions.filter(q => q.passageId === currentQ.passageId)
    const base  = questions.indexOf(group[0])
    const subs: { type: string; qs: Question[]; offset: number }[] = []
    let cur: (typeof subs)[0] | null = null; let off = 0
    group.forEach(q => {
      if (!cur || cur.type !== q.type) { cur = { type: q.type, qs: [], offset: off }; subs.push(cur) }
      cur.qs.push(q); off++
    })
    return subs.map(sg => {
      const s = base + sg.offset + 1, e = s + sg.qs.length - 1
      return (
        <div key={`${sg.type}-${sg.offset}`}>
          <div className="text-xs italic text-gray-400 px-3 py-2 bg-[#F7F6F2] border-l-[3px] border-[#1A2744] rounded-r-xl mb-3 mt-1">
            {subgroupInstruction(sg.type, s, e)}
          </div>
          {sg.qs.map((q, i) => (
            <QuestionCard key={q.id} question={q} questionNumber={base + sg.offset + i + 1}
              selected={answers[q.id]} onAnswer={setAnswer} onRemoveAnswer={removeAnswer} compact />
          ))}
        </div>
      )
    })
  }

  // Result phase
  if (phase === 'result' && result) return (
    <div className="w-full min-h-screen">
      <Header />
      <ResultView
        studentName={studentName}
        studentPhone={studentPhone}
        result={result}
        questions={questions}
        answers={answers}
        onRetry={() => router.push('/portal')}
        onContact={() => alert(`Tư vấn viên sẽ liên hệ số ${studentPhone} sớm nhất.`)}
      />
    </div>
  )

  const counterText = groupStart + 1 === groupEnd + 1
    ? `${groupStart + 1} / ${questions.length}`
    : `${groupStart + 1}–${groupEnd + 1} / ${questions.length}`

  return (
    <>
      <LoadingOverlay show={saving} message="Đang lưu kết quả..." />
      <Header timeLeft={timeLeft} />

      <main className={`w-full mx-auto px-3 sm:px-4 pt-4 sm:pt-8 pb-24 sm:pb-10 ${isSplit ? 'max-w-[1240px]' : 'max-w-[860px]'}`}>
        <div className="mb-2 text-sm text-gray-500 font-medium">{testName}</div>

        <QuestionNavigator questions={questions} answers={answers}
          currentGroupStart={groupStart} currentGroupEnd={groupEnd} onJump={jumpTo} />

        <div className={isSplit ? 'flex gap-4 sm:gap-6 items-start' : 'block'}>
          {isSplit && currentQ && (
            <div className="flex-[0_0_44%] sticky top-20 max-h-[calc(100vh-96px)] overflow-y-auto hidden md:block">
              {currentQ.section === 'reading'
                ? <ReadingPanel title={currentQ.passageTitle} content={currentQ.passageContent} />
                : <ListeningPanel title={currentQ.passageTitle} audioSrc={currentQ.passageAudio} passageId={currentQ.passageId!} />}
            </div>
          )}

          <div className="flex-1 min-w-0 w-full">
            {isSplit && currentQ && (
              <div className="md:hidden mb-3">
                {currentQ.section === 'reading'
                  ? <div className="max-h-52 overflow-y-auto rounded-2xl"><ReadingPanel title={currentQ.passageTitle} content={currentQ.passageContent} /></div>
                  : <ListeningPanel title={currentQ.passageTitle} audioSrc={currentQ.passageAudio} passageId={currentQ.passageId!} />}
              </div>
            )}

            {isSplit ? renderPassageQs() : currentQ
              ? <QuestionCard question={currentQ} questionNumber={currentIdx + 1}
                  selected={answers[currentQ.id]} onAnswer={setAnswer} onRemoveAnswer={removeAnswer} />
              : null}

            <div className="hidden sm:flex justify-between items-center gap-3 mt-4">
              <Button variant="outline" disabled={groupStart === 0} onClick={prevGroup}
                className="flex items-center gap-2 px-6 h-11 rounded-xl border-gray-200 text-[#1A2744] hover:border-[#1A2744] disabled:opacity-40">
                <ChevronLeft size={18} /> Quay lại
              </Button>
              <span className="text-sm text-gray-400">Câu {counterText} · {Object.keys(answers).length}/{questions.length} đã trả lời</span>
              <Button onClick={nextGroup}
                className="flex items-center gap-2 px-6 h-11 rounded-xl bg-[#E8303A] hover:bg-[#C0222B] text-white font-semibold border-0">
                {isLast ? <><CheckCircle size={18} /> Nộp bài</> : <>Tiếp theo <ChevronRight size={18} /></>}
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile sticky nav */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-[0_-4px_16px_rgba(26,39,68,0.10)] px-3 py-3">
        <div className="mb-2 flex justify-between text-[0.7rem] text-gray-400 font-medium">
          <span>Câu {counterText}</span>
          <span>{Object.keys(answers).length}/{questions.length} đã trả lời</span>
        </div>
        <div className="h-1 bg-gray-100 rounded-full mb-3 overflow-hidden">
          <div className="h-full bg-[#E8303A] rounded-full transition-all"
            style={{ width: `${questions.length ? (Object.keys(answers).length / questions.length) * 100 : 0}%` }} />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={groupStart === 0} onClick={prevGroup}
            className="flex-1 h-11 rounded-xl border-gray-200 text-[#1A2744] text-sm disabled:opacity-40">
            <ChevronLeft size={16} /> Quay lại
          </Button>
          <Button onClick={nextGroup}
            className="flex-[2] h-11 rounded-xl bg-[#E8303A] hover:bg-[#C0222B] text-white text-sm font-semibold border-0">
            {isLast ? <><CheckCircle size={16} /> Nộp bài</> : <>Tiếp theo <ChevronRight size={16} /></>}
          </Button>
        </div>
      </div>
    </>
  )
}
