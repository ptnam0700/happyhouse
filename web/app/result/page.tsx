'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { useTest } from '@/lib/test-context'
import { SECTION_NAMES } from '@/lib/test-utils'
import { ResultView } from '@/components/result/ResultView'

export default function ResultPage() {
  const router = useRouter()
  const { state, reset } = useTest()
  const { result, student, questions, answers } = state

  useEffect(() => {
    if (!result) router.replace('/')
  }, [result, router])

  if (!result) return null

  const handleRetry = () => { reset(); router.push('/') }
  const handleContact = () =>
    alert(`Cảm ơn bạn! Tư vấn viên HappyHouse sẽ liên hệ với số ${student.phone} sớm nhất.`)

  return (
    <div className="w-full min-h-screen">
      <Header />
      <ResultView
        studentName={student.name}
        studentPhone={student.phone}
        result={result}
        questions={questions}
        answers={answers}
        onRetry={handleRetry}
        onContact={handleContact}
      />
    </div>
  )
}
