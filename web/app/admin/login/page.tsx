'use client'

import Image from 'next/image'
import { useActionState } from 'react'
import { loginAction } from '@/lib/admin-actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function AdminLoginPage() {
  const [state, action, pending] = useActionState(loginAction, undefined)

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <Image src="/happy_house_sun.png" alt="logo" width={56} height={56} className="object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-[#1A2744]">HappyHouse Admin</h1>
          <p className="text-sm text-gray-400 mt-1">Đăng nhập để tiếp tục</p>
        </div>

        <form action={action} className="bg-white rounded-2xl p-7 shadow-[0_4px_24px_rgba(26,39,68,0.10)]">
          <div className="space-y-1.5 mb-5">
            <label className="text-sm font-semibold text-[#1A2744]">Mật khẩu</label>
            <Input
              type="password"
              name="password"
              placeholder="••••••••"
              autoComplete="current-password"
              className="h-11 border-[1.5px] border-gray-200 rounded-xl focus-visible:border-[#E8303A] focus-visible:ring-0"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5 mb-4">
              {state.error}
            </p>
          )}

          <Button
            type="submit"
            disabled={pending}
            className="w-full h-11 bg-[#E8303A] hover:bg-[#C0222B] text-white font-bold rounded-xl border-0"
          >
            {pending ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
        </form>
      </div>
    </div>
  )
}
