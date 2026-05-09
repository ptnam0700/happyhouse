'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function PortalLoginPage() {
  const router  = useRouter()
  const [phone, setPhone]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleLogin = async () => {
    const clean = phone.replace(/\s/g, '').replace(/^\+84/, '0')
    if (!clean || !password) { setError('Vui lòng nhập số điện thoại và mật khẩu'); return }

    setError(''); setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email:    `${clean}@hh.local`,
      password,
    })

    setLoading(false)
    if (error) {
      setError('Số điện thoại hoặc mật khẩu không đúng')
    } else {
      router.push('/portal')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <Image src="/happy_house_sun.png" alt="logo" width={56} height={56} className="object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-[#1A2744]">HappyHouse</h1>
          <p className="text-sm text-gray-400 mt-1">Cổng học viên</p>
        </div>

        <div className="bg-white rounded-2xl p-7 shadow-[0_4px_24px_rgba(26,39,68,0.10)] space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[#1A2744]">Số điện thoại</label>
            <Input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="0901234567"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="h-11 border-[1.5px] border-gray-200 rounded-xl focus-visible:border-[#E8303A] focus-visible:ring-0"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[#1A2744]">Mật khẩu</label>
            <Input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="h-11 border-[1.5px] border-gray-200 rounded-xl focus-visible:border-[#E8303A] focus-visible:ring-0"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5">{error}</p>
          )}

          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full h-11 bg-[#E8303A] hover:bg-[#C0222B] text-white font-bold rounded-xl border-0"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Liên hệ giáo viên nếu quên mật khẩu
        </p>
      </div>
    </div>
  )
}
