'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { QuestionForm, type QuestionData } from '@/components/admin/QuestionForm'
import { createStandaloneQuestion } from '../crudActions'

export default function NewQuestionPage() {
  const router = useRouter()
  const [, startTransition] = useTransition()

  const handleSave = async (data: QuestionData) => {
    const fd = new FormData()
    Object.entries(data).forEach(([k, v]) => fd.set(k, v ?? ''))
    await createStandaloneQuestion(fd)
  }

  return (
    <div className="p-4 sm:p-8 max-w-2xl">
      <Link href="/admin/questions" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#1A2744] mb-6 transition-colors">
        <ChevronLeft size={16} /> Danh sách câu hỏi
      </Link>
      <h1 className="text-xl font-bold text-[#1A2744] mb-6">Thêm câu hỏi mới</h1>
      <QuestionForm
        showSection
        defaultSection="grammar"
        onSave={handleSave}
        onCancel={() => router.push('/admin/questions')}
      />
    </div>
  )
}
