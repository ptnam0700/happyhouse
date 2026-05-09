'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { LoadingOverlay } from '@/components/layout/LoadingOverlay'
import { QuestionNavigator } from '@/components/test/QuestionNavigator'
import { QuestionCard } from '@/components/test/QuestionCard'
import { ReadingPanel } from '@/components/test/ReadingPanel'
import { ListeningPanel } from '@/components/test/ListeningPanel'
import { RegisterForm } from '@/components/landing/RegisterForm'
import { TestOptionCard } from '@/components/landing/TestOptionCard'
import { Button } from '@/components/ui/button'
import { useTest } from '@/lib/test-context'
import { createClient } from '@/lib/supabase/client'
import {
  loadQuestions,
  getGroupStart,
  getGroupEnd,
  mapServerScores,
  subgroupInstruction,
} from '@/lib/test-utils'
import type { Question, Student, TestType } from '@/types'

const FULL_TIME = 90 * 60
const MINI_TIME = 30 * 60
const LOADING_MSGS = ['Đang tải câu hỏi...', 'Đang chuẩn bị bài test...', 'Sắp xong rồi...']

export default function TestPage() {
  const router = useRouter()
  const { state, setAnswer, removeAnswer, setCurrentIndex, startTest, tickTimer, setResult, setStudent, setTestType } = useTest()

  const [loadingMsg, setLoadingMsg] = useState(LOADING_MSGS[0])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const loadedRef = useRef(false)
  const submittingRef = useRef(false)
  const loadingMsgIdxRef = useRef(0)

  const { questions, answers, currentIndex, timeLeft, testType, student, submitted, startTime } = state

  // Local state for the inline registration step
  const [regDone,       setRegDone]       = useState(!!state.student.name)
  const [selectedType,  setSelectedType]  = useState<TestType | null>(state.testType ?? null)

  const groupStart = questions.length ? getGroupStart(questions, currentIndex) : 0
  const groupEnd   = questions.length ? getGroupEnd(questions, currentIndex)   : 0
  const currentQ   = questions[currentIndex]
  const isLast     = groupEnd >= questions.length - 1
  const isSplitMode = !!currentQ?.passageId

  useEffect(() => {
    if (loadedRef.current || !student.name || !regDone) return
    loadedRef.current = true

    const supabase = createClient()
    setLoading(true)

    const msgInterval = setInterval(() => {
      loadingMsgIdxRef.current = (loadingMsgIdxRef.current + 1) % LOADING_MSGS.length
      setLoadingMsg(LOADING_MSGS[loadingMsgIdxRef.current])
    }, 900)

    loadQuestions(testType, supabase)
      .then(qs => {
        clearInterval(msgInterval)
        setLoading(false)
        startTest(qs, testType === 'full' ? FULL_TIME : MINI_TIME)
      })
      .catch(err => {
        clearInterval(msgInterval)
        setLoading(false)
        console.error('Failed to load questions:', err)
        alert('Không thể tải bài test. Vui lòng thử lại.')
        loadedRef.current = false
        setRegDone(false)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!questions.length || submitted) return
    timerRef.current = setInterval(tickTimer, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [questions.length, submitted, tickTimer])

  const handleSubmit = useCallback(async () => {
    if (submittingRef.current || submitted) return
    submittingRef.current = true
    if (timerRef.current) clearInterval(timerRef.current)

    setSaving(true)
    const supabase = createClient()
    const duration = startTime ? Math.round((Date.now() - startTime.getTime()) / 1000) : 0

    try {
      const { data, error } = await supabase.rpc('submit_test', {
        p_name:         student.name,
        p_phone:        student.phone,
        p_email:        student.email ?? '',
        p_test_type:    testType,
        p_started_at:   startTime?.toISOString() ?? new Date().toISOString(),
        p_duration_sec: duration,
        p_answers:      answers,
      })
      setSaving(false)
      if (error) throw error
      setResult(mapServerScores(data))
    } catch (err) {
      setSaving(false)
      console.error('Submit error:', err)
      setResult(mapServerScores({}))
    }

    router.push('/result')
  }, [submitted, startTime, student, testType, answers, setResult, router])

  useEffect(() => {
    if (timeLeft === 0 && questions.length && !submitted && !submittingRef.current) {
      handleSubmit()
    }
  }, [timeLeft, questions.length, submitted, handleSubmit])

  const confirmSubmit = useCallback(() => {
    const unanswered = questions.length - Object.keys(answers).length
    if (unanswered > 0 && !confirm(`Bạn còn ${unanswered} câu chưa trả lời. Bạn có chắc muốn nộp bài?`)) return
    handleSubmit()
  }, [questions.length, answers, handleSubmit])

  const jumpToQuestion = useCallback((idx: number) => {
    const gs = getGroupStart(questions, idx)
    setCurrentIndex(gs)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (idx !== gs) {
      requestAnimationFrame(() => {
        document.getElementById(`q_${questions[idx].id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }, [questions, setCurrentIndex])

  const prevGroup = useCallback(() => {
    if (groupStart === 0) return
    setCurrentIndex(getGroupStart(questions, groupStart - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [groupStart, questions, setCurrentIndex])

  const nextGroup = useCallback(() => {
    if (isLast) { confirmSubmit(); return }
    setCurrentIndex(groupEnd + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [isLast, groupEnd, setCurrentIndex, confirmSubmit])

  const renderPassageQuestions = () => {
    if (!currentQ?.passageId) return null
    const group = questions.filter(q => q.passageId === currentQ.passageId)
    const globalBase = questions.indexOf(group[0])

    const subGroups: { type: string; qs: Question[]; offset: number }[] = []
    let cur: { type: string; qs: Question[]; offset: number } | null = null
    let offset = 0
    group.forEach(q => {
      if (!cur || cur.type !== q.type) { cur = { type: q.type, qs: [], offset }; subGroups.push(cur) }
      cur.qs.push(q)
      offset++
    })

    return subGroups.map(sg => {
      const s = globalBase + sg.offset + 1
      const e = s + sg.qs.length - 1
      return (
        <div key={`${sg.type}-${sg.offset}`}>
          <div className="text-xs sm:text-sm italic text-gray-400 px-3 py-2 bg-[#F7F6F2] border-l-[3px] border-[#1A2744] rounded-r-xl mb-3 mt-1">
            {subgroupInstruction(sg.type, s, e)}
          </div>
          {sg.qs.map((q, i) => (
            <QuestionCard
              key={q.id}
              question={q}
              questionNumber={globalBase + sg.offset + i + 1}
              selected={answers[q.id]}
              onAnswer={setAnswer}
              onRemoveAnswer={removeAnswer}
              compact
            />
          ))}
        </div>
      )
    })
  }

  // ── Inline registration (when arrived directly at /test) ──────────
  if (!student.name || !student.phone) {
    return (
      <div className="w-full min-h-screen bg-[#F7F6F2]">
        <Header />
        <div className="w-full bg-gradient-to-br from-[#1A2744] to-[#243461] px-4 py-10 text-center text-white">
          <h1 className="text-[clamp(1.75rem,5vw,3rem)] font-bold leading-tight mb-2">
            Kiểm tra trình độ <span className="text-[#F5A623]">IELTS</span> miễn phí
          </h1>
          <p className="text-sm text-white/70 max-w-[420px] mx-auto">
            Bài kiểm tra chuẩn hoá do đội ngũ 8.5+ HappyHouse thiết kế — nhận kết quả ngay.
          </p>
        </div>
        <div className="w-full px-4">
          <RegisterForm
            onSubmit={(s: Student) => {
              setStudent(s)
            }}
          />
        </div>
      </div>
    )
  }

  // ── Test type selection (after registration, before loading) ───────
  if (!regDone) {
    return (
      <div className="w-full min-h-screen bg-[#F7F6F2]">
        <Header />
        <div className="max-w-[860px] mx-auto px-4 py-10">
          <h2 className="text-xl font-bold text-[#1A2744] text-center mb-2">
            Xin chào, {student.name}!
          </h2>
          <p className="text-center text-gray-400 text-sm mb-8">Chọn loại bài kiểm tra phù hợp với bạn</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
            <TestOptionCard type="full" selected={selectedType === 'full'} onSelect={t => { setSelectedType(t); setTestType(t) }} />
            <TestOptionCard type="mini" selected={selectedType === 'mini'} onSelect={t => { setSelectedType(t); setTestType(t) }} />
          </div>
          {selectedType && (
            <div className="flex justify-center">
              <Button
                onClick={() => setRegDone(true)}
                className="w-full sm:w-auto sm:min-w-[240px] bg-[#E8303A] hover:bg-[#C0222B] text-white font-bold text-base sm:text-lg h-12 sm:h-14 rounded-xl tracking-wide border-0"
              >
                BẮT ĐẦU LÀM BÀI →
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (loading || (!questions.length && !saving)) {
    return <LoadingOverlay show message={loadingMsg} />
  }

  const answeredCount = Object.keys(answers).length
  const counterText = groupStart + 1 === groupEnd + 1
    ? `${groupStart + 1} / ${questions.length}`
    : `${groupStart + 1}–${groupEnd + 1} / ${questions.length}`

  return (
    <>
      <LoadingOverlay show={saving} message="Đang lưu kết quả..." />
      <Header timeLeft={timeLeft} />

      {/* Main content — bottom padding reserves space for the mobile sticky nav */}
      <main className={`w-full mx-auto px-3 sm:px-4 pt-4 sm:pt-8 pb-24 sm:pb-10 ${isSplitMode ? 'max-w-[1240px]' : 'max-w-[860px]'}`}>
        <QuestionNavigator
          questions={questions}
          answers={answers}
          currentGroupStart={groupStart}
          currentGroupEnd={groupEnd}
          onJump={jumpToQuestion}
        />

        <div className={isSplitMode ? 'flex gap-4 sm:gap-6 items-start' : 'block'}>
          {/* Left panel: desktop only */}
          {isSplitMode && currentQ && (
            <div className="flex-[0_0_44%] sticky top-20 max-h-[calc(100vh-96px)] overflow-y-auto hidden md:block">
              {currentQ.section === 'reading' ? (
                <ReadingPanel key={currentQ.passageId} title={currentQ.passageTitle} content={currentQ.passageContent} />
              ) : (
                <ListeningPanel
                  key={currentQ.passageId}
                  title={currentQ.passageTitle}
                  audioSrc={currentQ.passageAudio}
                  passageId={currentQ.passageId!}
                />
              )}
            </div>
          )}

          <div className="flex-1 min-w-0 w-full">
            {/* Mobile: passage above questions */}
            {isSplitMode && currentQ && (
              <div className="md:hidden mb-3">
                {currentQ.section === 'reading' ? (
                  <div className="max-h-52 overflow-y-auto rounded-2xl">
                    <ReadingPanel key={currentQ.passageId} title={currentQ.passageTitle} content={currentQ.passageContent} />
                  </div>
                ) : (
                  <ListeningPanel
                    key={currentQ.passageId}
                    title={currentQ.passageTitle}
                    audioSrc={currentQ.passageAudio}
                    passageId={currentQ.passageId!}
                  />
                )}
              </div>
            )}

            {isSplitMode ? renderPassageQuestions() : currentQ ? (
              <QuestionCard
                question={currentQ}
                questionNumber={currentIndex + 1}
                selected={answers[currentQ.id]}
                onAnswer={setAnswer}
                onRemoveAnswer={removeAnswer}
              />
            ) : null}

            {/* Desktop inline nav */}
            <div className="hidden sm:flex justify-between items-center gap-3 mt-4">
              <Button
                variant="outline"
                disabled={groupStart === 0}
                onClick={prevGroup}
                className="flex items-center gap-2 px-6 h-11 rounded-xl border-gray-200 text-[#1A2744] font-semibold hover:border-[#1A2744] disabled:opacity-40"
              >
                <ChevronLeft size={18} />
                Quay lại
              </Button>
              <span className="text-sm text-gray-400">
                Câu {counterText} · {answeredCount}/{questions.length} đã trả lời
              </span>
              <Button
                onClick={nextGroup}
                className="flex items-center gap-2 px-6 h-11 rounded-xl bg-[#E8303A] hover:bg-[#C0222B] text-white font-semibold border-0"
              >
                {isLast ? (
                  <><CheckCircle size={18} /> Nộp bài</>
                ) : (
                  <>Tiếp theo <ChevronRight size={18} /></>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile sticky bottom nav */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-[0_-4px_16px_rgba(26,39,68,0.10)] px-3 py-3">
        {/* Progress bar */}
        <div className="mb-2.5 flex items-center justify-between text-[0.7rem] text-gray-400 font-medium">
          <span>Câu {counterText}</span>
          <span>{answeredCount}/{questions.length} đã trả lời</span>
        </div>
        <div className="h-1 bg-gray-100 rounded-full mb-3 overflow-hidden">
          <div
            className="h-full bg-[#E8303A] rounded-full transition-all duration-300"
            style={{ width: `${questions.length ? (answeredCount / questions.length) * 100 : 0}%` }}
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={groupStart === 0}
            onClick={prevGroup}
            className="flex items-center justify-center gap-1.5 flex-1 h-11 rounded-xl border-gray-200 text-[#1A2744] font-semibold text-sm disabled:opacity-40"
          >
            <ChevronLeft size={16} />
            Quay lại
          </Button>
          <Button
            onClick={nextGroup}
            className="flex items-center justify-center gap-1.5 flex-[2] h-11 rounded-xl bg-[#E8303A] hover:bg-[#C0222B] text-white font-semibold text-sm border-0"
          >
            {isLast ? (
              <><CheckCircle size={16} /> Nộp bài</>
            ) : (
              <>Tiếp theo <ChevronRight size={16} /></>
            )}
          </Button>
        </div>
      </div>
    </>
  )
}
