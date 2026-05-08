'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { QuestionForm, type QuestionData } from '@/components/admin/QuestionForm'
import { updateStandaloneQuestion, deleteStandaloneQuestion } from '../crudActions'
import { Button } from '@/components/ui/button'

interface Props { id: string; initial: QuestionData }

export function EditQuestionClient({ id, initial }: Props) {
  const router = useRouter()

  const handleSave = async (data: QuestionData) => {
    const fd = new FormData()
    Object.entries(data).forEach(([k, v]) => fd.set(k, v ?? ''))
    await updateStandaloneQuestion(id, fd)
  }

  const handleDelete = async () => {
    if (!confirm('Xoá câu hỏi này?')) return
    await deleteStandaloneQuestion(id)
  }

  return (
    <div className="p-4 sm:p-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <Link href="/admin/questions" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#1A2744] transition-colors">
          <ChevronLeft size={16} /> Danh sách câu hỏi
        </Link>
        <Button variant="outline" onClick={handleDelete}
          className="h-9 px-4 rounded-xl border-red-200 text-red-500 hover:bg-red-50 text-sm">
          Xoá câu hỏi
        </Button>
      </div>
      <h1 className="text-xl font-bold text-[#1A2744] mb-6">Chỉnh sửa câu hỏi</h1>
      <QuestionForm
        initial={initial}
        showSection
        defaultSection={initial.section}
        onSave={handleSave}
        onCancel={() => router.push('/admin/questions')}
      />
    </div>
  )
}
