'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { LoadingOverlay } from '@/components/layout/LoadingOverlay'
import { QuestionNavigator } from '@/components/test/QuestionNavigator'
import { QuestionCard } from '@/components/test/QuestionCard'
import { ReadingPanel } from '@/components/test/ReadingPanel'
import { ListeningPanel } from '@/components/test/ListeningPanel'
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
import type { Question } from '@/types'

const FULL_TIME = 90 * 60
const MINI_TIME = 30 * 60
const LOADING_MSGS = ['Đang tải câu hỏi...', 'Đang chuẩn bị bài test...', 'Sắp xong rồi...']

export default function TestPage() {
  const router = useRouter()
  const { state, setAnswer, removeAnswer, setCurrentIndex, startTest, tickTimer, setResult } = useTest()

  const [loadingMsg, setLoadingMsg] = useState(LOADING_MSGS[0])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const loadedRef = useRef(false)
  const submittingRef = useRef(false)
  const loadingMsgIdxRef = useRef(0)

  const { questions, answers, currentIndex, timeLeft, testType, student, submitted, startTime } = state

  const groupStart = questions.length ? getGroupStart(questions, currentIndex) : 0
  const groupEnd   = questions.length ? getGroupEnd(questions, currentIndex)   : 0
  const currentQ   = questions[currentIndex]
  const isLast     = groupEnd >= questions.length - 1
  const isSplitMode = !!currentQ?.passageId

  // Redirect if no student info
  useEffect(() => {
    if (!student.name || !student.phone) router.replace('/')
  }, [student, router])

  // Load questions once
  useEffect(() => {
    if (loadedRef.current || !student.name) return
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
        router.replace('/')
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Run timer
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

  // Auto-submit on timeout
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
          <div className="text-sm italic text-gray-400 px-4 py-2.5 bg-[#F7F6F2] border-l-[3px] border-[#1A2744] rounded-r-xl mb-3 mt-1">
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

  if (loading || (!questions.length && !saving)) {
    return <LoadingOverlay show message={loadingMsg} />
  }

  const counterText = groupStart + 1 === groupEnd + 1
    ? `Câu ${groupStart + 1} / ${questions.length}`
    : `Câu ${groupStart + 1}–${groupEnd + 1} / ${questions.length}`

  return (
    <>
      <LoadingOverlay show={saving} message="Đang lưu kết quả..." />
      <Header timeLeft={timeLeft} />

      <main className={`mx-auto px-4 py-8 ${isSplitMode ? 'max-w-[1240px]' : 'max-w-[860px]'}`}>
        <QuestionNavigator
          questions={questions}
          answers={answers}
          currentGroupStart={groupStart}
          currentGroupEnd={groupEnd}
          onJump={jumpToQuestion}
        />

        <div className={isSplitMode ? 'flex gap-6 items-start' : 'block'}>
          {/* Left: passage or listening panel */}
          {isSplitMode && currentQ && (
            <div className="flex-[0_0_44%] sticky top-20 max-h-[calc(100vh-96px)] overflow-y-auto md:block hidden">
              {currentQ.section === 'reading' ? (
                <ReadingPanel title={currentQ.passageTitle} content={currentQ.passageContent} />
              ) : (
                <ListeningPanel
                  title={currentQ.passageTitle}
                  audioSrc={currentQ.passageAudio}
                  passageId={currentQ.passageId!}
                />
              )}
            </div>
          )}

          {/* Right: question(s) */}
          <div className="flex-1 min-w-0">
            {/* Mobile: show passage above questions */}
            {isSplitMode && currentQ && (
              <div className="md:hidden mb-4">
                {currentQ.section === 'reading' ? (
                  <div className="max-h-48 overflow-y-auto">
                    <ReadingPanel title={currentQ.passageTitle} content={currentQ.passageContent} />
                  </div>
                ) : (
                  <ListeningPanel
                    title={currentQ.passageTitle}
                    audioSrc={currentQ.passageAudio}
                    passageId={currentQ.passageId!}
                  />
                )}
              </div>
            )}

            {isSplitMode ? (
              renderPassageQuestions()
            ) : currentQ ? (
              <QuestionCard
                question={currentQ}
                questionNumber={currentIndex + 1}
                selected={answers[currentQ.id]}
                onAnswer={setAnswer}
                onRemoveAnswer={removeAnswer}
              />
            ) : null}

            {/* Navigation */}
            <div className="flex justify-between items-center gap-4 flex-wrap mt-2">
              <Button
                variant="outline"
                disabled={groupStart === 0}
                onClick={prevGroup}
                className="px-8 h-11 rounded-xl border-gray-200 text-[#1A2744] font-semibold hover:border-[#1A2744] disabled:opacity-40"
              >
                ← Quay lại
              </Button>
              <span className="text-sm text-gray-400">{counterText}</span>
              <Button
                onClick={nextGroup}
                className="px-8 h-11 rounded-xl bg-[#E8303A] hover:bg-[#C0222B] text-white font-semibold border-0"
              >
                {isLast ? 'Nộp bài ✓' : 'Tiếp theo →'}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
