'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { toggleQuestionActive } from './actions'

export function ToggleActiveButton({ id, active }: { id: string; active: boolean }) {
  const [optimistic, setOptimistic] = useState(active)
  const [pending, startTransition]  = useTransition()

  const handle = () => {
    const next = !optimistic
    setOptimistic(next)                    // flip immediately
    startTransition(async () => {
      try {
        await toggleQuestionActive(id, optimistic)
      } catch {
        setOptimistic(!next)               // revert on failure
        toast.error('Không thể cập nhật trạng thái')
      }
    })
  }

  return (
    <button
      onClick={handle}
      disabled={pending}
      title={optimistic ? 'Click để ẩn' : 'Click để hiện'}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:cursor-wait ${
        optimistic ? 'bg-emerald-500' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          optimistic ? 'translate-x-[18px]' : 'translate-x-1'
        }`}
      />
    </button>
  )
}
