'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { RegisterForm } from '@/components/landing/RegisterForm'
import { TestOptionCard } from '@/components/landing/TestOptionCard'
import { Button } from '@/components/ui/button'
import { useTest } from '@/lib/test-context'
import type { Student, TestType } from '@/types'

export default function LandingPage() {
  const router = useRouter()
  const { setStudent, setTestType } = useTest()
  const [showTestSelect, setShowTestSelect] = useState(false)
  const [selectedType, setSelectedType] = useState<TestType | null>(null)

  const handleRegister = (student: Student) => {
    setStudent(student)
    setShowTestSelect(true)
  }

  const handleSelectType = (type: TestType) => {
    setSelectedType(type)
    setTestType(type)
  }

  const handleStart = () => {
    if (!selectedType) return
    router.push('/test')
  }

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#1A2744] to-[#243461] px-4 sm:px-8 py-12 sm:py-20 text-center text-white">
        <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-bold leading-tight mb-4">
          Kiểm tra trình độ
          <br />
          <span className="text-[#F5A623]">IELTS</span> của bạn
        </h1>
        <p className="text-base text-white/75 max-w-[560px] mx-auto">
          Bài kiểm tra chuẩn hoá được thiết kế bởi đội ngũ 8.5+ IELTS của HappyHouse
        </p>
      </div>

      {/* Register card */}
      <div className="px-4">
        <RegisterForm onSubmit={handleRegister} />
      </div>

      {/* Test type selection */}
      {showTestSelect && (
        <div className="max-w-[860px] mx-auto px-4 mt-12 pb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <TestOptionCard type="full" selected={selectedType === 'full'} onSelect={handleSelectType} />
            <TestOptionCard type="mini" selected={selectedType === 'mini'} onSelect={handleSelectType} />
          </div>

          {selectedType && (
            <div className="flex justify-center mt-8">
              <Button
                onClick={handleStart}
                className="bg-[#E8303A] hover:bg-[#C0222B] text-white font-bold text-base sm:text-lg px-8 sm:px-12 h-12 sm:h-14 rounded-xl tracking-wide border-0 w-full sm:w-auto"
              >
                BẮT ĐẦU LÀM BÀI →
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
