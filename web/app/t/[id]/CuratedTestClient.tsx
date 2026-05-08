'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Header } from '@/components/layout/Header'
import { LoadingOverlay } from '@/components/layout/LoadingOverlay'
import { RegisterForm } from '@/components/landing/RegisterForm'
import { QuestionNavigator } from '@/components/test/QuestionNavigator'
import { QuestionCard } from '@/components/test/QuestionCard'
import { ReadingPanel } from '@/components/test/ReadingPanel'
import { ListeningPanel } from '@/components/test/ListeningPanel'
import { BandCircle } from '@/components/result/BandCircle'
import { ScoreCard } from '@/components/result/ScoreCard'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import {
  getGroupStart, getGroupEnd, mapServerScores, subgroupInstruction,
  SECTION_NAMES, LEVEL_MESSAGES,
} from '@/lib/test-utils'
import type { Question, Student, Answers, TestResult } from '@/types'
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react'

type Phase = 'register' | 'testing' | 'result'

interface Props {
  testId:     string
  testName:   string
  testDesc:   string | null
  timeLimitSec: number
  questions:  Question[]
}

export function CuratedTestClient({ testId, testName, testDesc, timeLimitSec, questions }: Props) {
  const [phase, setPhase]       = useState<Phase>('register')
  const [student, setStudent]   = useState<Student>({ name: '', phone: '', email: '' })
  const [answers, setAnswers]   = useState<Answers>({})
  const [currentIndex, setIdx]  = useState(0)
  const [timeLeft, setTimeLeft] = useState(timeLimitSec)
  const [saving, setSaving]     = useState(false)
  const [result, setResult]     = useState<TestResult | null>(null)
  const startTimeRef            = useRef<Date | null>(null)
  const timerRef                = useRef<ReturnType<typeof setInterval> | null>(null)
  const submittingRef           = useRef(false)

  const groupStart = questions.length ? getGroupStart(questions, currentIndex) : 0
  const groupEnd   = questions.length ? getGroupEnd(questions, currentIndex)   : 0
  const currentQ   = questions[currentIndex]
  const isLast     = groupEnd >= questions.length - 1
  const isSplitMode = !!currentQ?.passageId

  const setAnswer = useCallback((qid: string, value: string) =>
    setAnswers(prev => ({ ...prev, [qid]: value })), [])
  const removeAnswer = useCallback((qid: string) =>
    setAnswers(prev => { const { [qid]: _, ...rest } = prev; return rest }), [])

  // Timer
  useEffect(() => {
    if (phase !== 'testing') return
    timerRef.current = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phase])

  const handleSubmit = useCallback(async () => {
    if (submittingRef.current) return
    submittingRef.current = true
    if (timerRef.current) clearInterval(timerRef.current)
    setSaving(true)

    const supabase = createClient()
    const duration = startTimeRef.current ? Math.round((Date.now() - startTimeRef.current.getTime()) / 1000) : 0

    try {
      const { data, error } = await supabase.rpc('submit_test', {
        p_name:         student.name,
        p_phone:        student.phone,
        p_email:        student.email ?? '',
        p_test_type:    'full',
        p_started_at:   startTimeRef.current?.toISOString() ?? new Date().toISOString(),
        p_duration_sec: duration,
        p_answers:      answers,
        p_test_id:      testId,
      })
      if (error) throw error
      setResult(mapServerScores(data))
    } catch {
      setResult(mapServerScores({}))
    }
    setSaving(false)
    setPhase('result')
  }, [student, answers, testId])

  // Auto-submit on timeout
  useEffect(() => {
    if (timeLeft === 0 && phase === 'testing' && !submittingRef.current) handleSubmit()
  }, [timeLeft, phase, handleSubmit])

  const handleStart = (s: Student) => {
    setStudent(s)
    startTimeRef.current = new Date()
    setPhase('testing')
    window.scrollTo({ top: 0 })
  }

  const confirmSubmit = () => {
    const unanswered = questions.length - Object.keys(answers).length
    if (unanswered > 0 && !confirm(`Bạn còn ${unanswered} câu chưa trả lời. Bạn có chắc muốn nộp?`)) return
    handleSubmit()
  }

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
    const gs = getGroupStart(questions, i)
    setIdx(gs)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const renderPassageQuestions = () => {
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
          <div className="text-xs sm:text-sm italic text-gray-400 px-3 py-2 bg-[#F7F6F2] border-l-[3px] border-[#1A2744] rounded-r-xl mb-3 mt-1">
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

  // ── Register phase ──────────────────────────────────────────────
  if (phase === 'register') return (
    <div className="w-full min-h-screen">
      <Header />
      <div className="w-full bg-gradient-to-br from-[#1A2744] to-[#243461] px-4 py-12 sm:py-16 text-center text-white">
        <h1 className="text-[clamp(1.5rem,4vw,2.5rem)] font-bold leading-tight mb-3">{testName}</h1>
        {testDesc && <p className="text-sm text-white/70 max-w-[480px] mx-auto mb-3">{testDesc}</p>}
        <p className="text-sm text-white/60">⏱ {Math.round(timeLimitSec / 60)} phút · {questions.length} câu hỏi</p>
      </div>
      <div className="w-full px-4">
        <RegisterForm onSubmit={handleStart} />
      </div>
    </div>
  )

  // ── Result phase ────────────────────────────────────────────────
  if (phase === 'result' && result) return (
    <div className="w-full min-h-screen">
      <Header />
      <div className="w-full max-w-[700px] mx-auto px-4 py-8 sm:py-12 text-center">
        <BandCircle band={result.band} />
        <h1 className="text-xl sm:text-2xl font-bold text-[#1A2744] mb-2">Xin chúc mừng, {student.name}!</h1>
        <p className="text-sm sm:text-base text-gray-400 mb-8">{LEVEL_MESSAGES[result.bandLevel] ?? ''}</p>

        <div
          className="flex items-start sm:items-center gap-3 rounded-xl px-4 sm:px-5 py-4 mb-6 text-left"
          style={{ background: `${result.teacherNote.color}18`, border: `1.5px solid ${result.teacherNote.color}40` }}
        >
          <span className="text-2xl shrink-0">{result.teacherNote.icon}</span>
          <div>
            <div className="text-[0.7rem] font-bold uppercase tracking-wide mb-0.5" style={{ color: result.teacherNote.color }}>Gợi ý lộ trình</div>
            <div className="text-sm font-semibold" style={{ color: result.teacherNote.color }}>{result.teacherNote.text}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          {Object.entries(result.sections).map(([k, v]) => (
            <ScoreCard key={k} label={SECTION_NAMES[k] ?? k} correct={v.correct} total={v.total} />
          ))}
          <ScoreCard label="Tổng điểm" correct={result.totalCorrect} total={result.totalQ} />
        </div>

        <div className="bg-[#1A2744] text-white rounded-2xl p-5 sm:p-8 mb-4">
          <h3 className="text-base sm:text-lg font-bold mb-2">Bạn muốn cải thiện trình độ?</h3>
          <p className="text-xs sm:text-sm opacity-80 mb-5">Tư vấn viên HappyHouse sẽ liên hệ để tư vấn lộ trình học phù hợp</p>
          <Button onClick={() => alert(`Cảm ơn bạn! Tư vấn viên sẽ liên hệ số ${student.phone} sớm nhất.`)}
            className="w-full sm:w-auto bg-[#E8303A] hover:bg-[#C0222B] text-white font-bold px-8 h-11 rounded-xl border-0">
            Đăng ký tư vấn miễn phí
          </Button>
        </div>
      </div>
    </div>
  )

  // ── Test phase ──────────────────────────────────────────────────
  const counterText = groupStart + 1 === groupEnd + 1
    ? `${groupStart + 1} / ${questions.length}`
    : `${groupStart + 1}–${groupEnd + 1} / ${questions.length}`
  const answeredCount = Object.keys(answers).length

  return (
    <>
      <LoadingOverlay show={saving} message="Đang lưu kết quả..." />
      <Header timeLeft={timeLeft} />

      <main className={`w-full mx-auto px-3 sm:px-4 pt-4 sm:pt-8 pb-24 sm:pb-10 ${isSplitMode ? 'max-w-[1240px]' : 'max-w-[860px]'}`}>
        <QuestionNavigator questions={questions} answers={answers}
          currentGroupStart={groupStart} currentGroupEnd={groupEnd} onJump={jumpTo} />

        <div className={isSplitMode ? 'flex gap-4 sm:gap-6 items-start' : 'block'}>
          {isSplitMode && currentQ && (
            <div className="flex-[0_0_44%] sticky top-20 max-h-[calc(100vh-96px)] overflow-y-auto hidden md:block">
              {currentQ.section === 'reading'
                ? <ReadingPanel title={currentQ.passageTitle} content={currentQ.passageContent} />
                : <ListeningPanel title={currentQ.passageTitle} audioSrc={currentQ.passageAudio} passageId={currentQ.passageId!} />}
            </div>
          )}

          <div className="flex-1 min-w-0 w-full">
            {isSplitMode && currentQ && (
              <div className="md:hidden mb-3">
                {currentQ.section === 'reading'
                  ? <div className="max-h-52 overflow-y-auto rounded-2xl"><ReadingPanel title={currentQ.passageTitle} content={currentQ.passageContent} /></div>
                  : <ListeningPanel title={currentQ.passageTitle} audioSrc={currentQ.passageAudio} passageId={currentQ.passageId!} />}
              </div>
            )}

            {isSplitMode ? renderPassageQuestions() : currentQ
              ? <QuestionCard question={currentQ} questionNumber={currentIndex + 1}
                  selected={answers[currentQ.id]} onAnswer={setAnswer} onRemoveAnswer={removeAnswer} />
              : null}

            {/* Desktop nav */}
            <div className="hidden sm:flex justify-between items-center gap-3 mt-4">
              <Button variant="outline" disabled={groupStart === 0} onClick={prevGroup}
                className="flex items-center gap-2 px-6 h-11 rounded-xl border-gray-200 text-[#1A2744] font-semibold hover:border-[#1A2744] disabled:opacity-40">
                <ChevronLeft size={18} /> Quay lại
              </Button>
              <span className="text-sm text-gray-400">Câu {counterText} · {answeredCount}/{questions.length} đã trả lời</span>
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
        <div className="mb-2 flex items-center justify-between text-[0.7rem] text-gray-400 font-medium">
          <span>Câu {counterText}</span>
          <span>{answeredCount}/{questions.length} đã trả lời</span>
        </div>
        <div className="h-1 bg-gray-100 rounded-full mb-3 overflow-hidden">
          <div className="h-full bg-[#E8303A] rounded-full transition-all"
            style={{ width: `${questions.length ? (answeredCount / questions.length) * 100 : 0}%` }} />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={groupStart === 0} onClick={prevGroup}
            className="flex-1 h-11 rounded-xl border-gray-200 text-[#1A2744] font-semibold text-sm disabled:opacity-40">
            <ChevronLeft size={16} /> Quay lại
          </Button>
          <Button onClick={nextGroup}
            className="flex-[2] h-11 rounded-xl bg-[#E8303A] hover:bg-[#C0222B] text-white font-semibold text-sm border-0">
            {isLast ? <><CheckCircle size={16} /> Nộp bài</> : <>Tiếp theo <ChevronRight size={16} /></>}
          </Button>
        </div>
      </div>
    </>
  )
}
