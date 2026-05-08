'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { BandCircle } from '@/components/result/BandCircle'
import { ScoreCard } from '@/components/result/ScoreCard'
import { Button } from '@/components/ui/button'
import { useTest } from '@/lib/test-context'
import { SECTION_NAMES, LEVEL_MESSAGES } from '@/lib/test-utils'

export default function ResultPage() {
  const router = useRouter()
  const { state, reset } = useTest()
  const { result, student } = state

  useEffect(() => {
    if (!result) router.replace('/')
  }, [result, router])

  if (!result) return null

  const { band, bandLevel, sections, totalCorrect, totalQ, pct, teacherNote } = result

  const handleRetry = () => {
    reset()
    router.push('/')
  }

  const handleContact = () => {
    alert(`Cảm ơn bạn! Tư vấn viên HappyHouse sẽ liên hệ với số ${student.phone} trong thời gian sớm nhất.`)
  }

  return (
    <div className="min-h-screen">
      <Header />

      <div className="max-w-[700px] mx-auto px-4 py-12 text-center">
        <BandCircle band={band} />

        <h1 className="text-2xl font-bold text-[#1A2744] mb-2">
          Xin chúc mừng, {student.name}!
        </h1>
        <p className="text-gray-400 mb-10">{LEVEL_MESSAGES[bandLevel] ?? ''}</p>

        {/* Teacher note */}
        <div
          className="flex items-center gap-3 rounded-xl px-5 py-4 mb-6 text-left"
          style={{ background: `${teacherNote.color}18`, border: `1.5px solid ${teacherNote.color}40` }}
        >
          <span className="text-2xl">{teacherNote.icon}</span>
          <div>
            <div
              className="text-xs font-bold uppercase tracking-wide mb-0.5"
              style={{ color: teacherNote.color }}
            >
              Gợi ý lộ trình
            </div>
            <div className="text-[0.95rem] font-semibold" style={{ color: teacherNote.color }}>
              {teacherNote.text}
            </div>
          </div>
        </div>

        {/* Section scores */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
          {Object.entries(sections).map(([key, val]) => (
            <ScoreCard
              key={key}
              label={SECTION_NAMES[key] ?? key}
              correct={val.correct}
              total={val.total}
            />
          ))}
          <ScoreCard
            label="Tổng điểm"
            correct={totalCorrect}
            total={totalQ}
          />
        </div>

        {/* CTA */}
        <div className="bg-[#1A2744] text-white rounded-2xl p-8 mb-6">
          <h3 className="text-lg font-bold mb-2">Bạn muốn cải thiện trình độ?</h3>
          <p className="text-sm opacity-80 mb-5">
            Tư vấn viên HappyHouse sẽ liên hệ để tư vấn lộ trình học IELTS phù hợp với bạn
          </p>
          <Button
            onClick={handleContact}
            className="bg-[#E8303A] hover:bg-[#C0222B] text-white font-bold px-8 h-11 rounded-xl border-0"
          >
            Đăng ký tư vấn miễn phí
          </Button>
        </div>

        <Button
          variant="outline"
          onClick={handleRetry}
          className="border-gray-200 text-gray-400 hover:border-[#1A2744] hover:text-[#1A2744] h-11 px-8 rounded-xl"
        >
          Làm lại bài test
        </Button>
      </div>
    </div>
  )
}
