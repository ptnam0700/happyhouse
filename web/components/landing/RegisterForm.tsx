'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Student } from '@/types'

interface RegisterFormProps {
  onSubmit: (student: Student) => void
  className?: string
}

export function RegisterForm({ onSubmit, className }: RegisterFormProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    if (!name.trim() || !phone.trim()) {
      setError('Vui lòng điền họ tên và số điện thoại')
      return
    }
    if (!/^(0|\+84)[0-9]{8,10}$/.test(phone.replace(/\s/g, ''))) {
      setError('Số điện thoại không hợp lệ')
      return
    }
    setError('')
    onSubmit({ name: name.trim(), phone: phone.replace(/\s/g, ''), email: email.trim() })
  }

  return (
    <div className={cn('bg-white rounded-[20px] p-10 max-w-[480px] mx-auto shadow-[0_4px_24px_rgba(26,39,68,0.10)] -mt-8 relative z-10', className)}>
      <h2 className="text-[1.4rem] font-bold text-[#1A2744] mb-1.5 text-center">Thông tin thí sinh</h2>
      <p className="text-center text-gray-400 text-sm mb-8">Vui lòng điền thông tin để bắt đầu làm bài</p>

      <div className="space-y-5">
        <div className="space-y-1.5">
          <Label className="text-[0.85rem] font-semibold text-[#1A2744]">Họ và tên *</Label>
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nguyễn Văn A"
            className="border-[1.5px] border-gray-200 rounded-xl focus-visible:border-[#E8303A] focus-visible:ring-0 h-11"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[0.85rem] font-semibold text-[#1A2744]">Số điện thoại *</Label>
          <Input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="0901234567"
            className="border-[1.5px] border-gray-200 rounded-xl focus-visible:border-[#E8303A] focus-visible:ring-0 h-11"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[0.85rem] font-semibold text-[#1A2744]">Email</Label>
          <Input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="email@example.com"
            className="border-[1.5px] border-gray-200 rounded-xl focus-visible:border-[#E8303A] focus-visible:ring-0 h-11"
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>
        )}

        <Button
          onClick={handleSubmit}
          className="w-full h-12 bg-[#E8303A] hover:bg-[#C0222B] text-white font-bold text-base rounded-xl tracking-wide border-0"
        >
          TIẾP THEO →
        </Button>
      </div>
    </div>
  )
}
