'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RegisterForm } from '@/components/landing/RegisterForm'
import { TestOptionCard } from '@/components/landing/TestOptionCard'
import { Button } from '@/components/ui/button'
import { useTest } from '@/lib/test-context'
import type { Student, TestType } from '@/types'

export function LandingClient() {
  const router = useRouter()
  const { setStudent, setTestType } = useTest()
  const [showTestSelect, setShowTestSelect] = useState(false)
  const [selectedType, setSelectedType] = useState<TestType | null>(null)

  const handleRegister = (student: Student) => {
    setStudent(student)
    setShowTestSelect(true)
    setTimeout(() => {
      document.getElementById('test-select')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
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
    <>
      {/* Register card */}
      <div className="w-full px-4">
        <RegisterForm onSubmit={handleRegister} />
      </div>

      {/* Test type selection */}
      {showTestSelect && (
        <div id="test-select" className="w-full max-w-[860px] mx-auto px-4 mt-10 pb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <TestOptionCard type="full" selected={selectedType === 'full'} onSelect={handleSelectType} />
            <TestOptionCard type="mini" selected={selectedType === 'mini'} onSelect={handleSelectType} />
          </div>

          {selectedType && (
            <div className="mt-6">
              <Button
                onClick={handleStart}
                className="w-full sm:w-auto sm:min-w-[240px] bg-[#E8303A] hover:bg-[#C0222B] text-white font-bold text-base sm:text-lg h-12 sm:h-14 rounded-xl tracking-wide border-0 block sm:mx-auto"
              >
                BẮT ĐẦU LÀM BÀI →
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  )
}
