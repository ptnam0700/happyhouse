'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft } from 'lucide-react'
import { ResultView } from '@/components/result/ResultView'
import type { Question, TestResult, Answers } from '@/types'

interface Props {
  studentName: string; studentPhone: string
  result:      TestResult
  questions:   Question[]; answers: Answers
  testName:    string; submittedAt: string | null
}

export function PortalResultClient({ studentName, studentPhone, result, questions, answers, testName, submittedAt }: Props) {
  return (
    <div className="min-h-screen bg-[#F7F6F2]">
      <header className="bg-[#1A2744] px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Image src="/happy_house_sun.png" alt="logo" width={32} height={32} className="object-contain" />
          <span className="text-white font-bold text-base">HappyHouse</span>
        </div>
        <Link href="/portal" className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors">
          <ChevronLeft size={15} /> Về trang chủ
        </Link>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-4 pb-2 text-center">
        <p className="text-sm font-semibold text-[#1A2744]">{testName}</p>
        {submittedAt && (
          <p className="text-xs text-gray-400 mt-0.5">
            Nộp bài: {new Date(submittedAt).toLocaleString('vi-VN')}
          </p>
        )}
      </div>

      <ResultView
        studentName={studentName}
        studentPhone={studentPhone}
        result={result}
        questions={questions}
        answers={answers}
        onRetry={() => window.history.back()}
        onContact={() => alert(`Tư vấn viên sẽ liên hệ số ${studentPhone} sớm nhất.`)}
      />
    </div>
  )
}
