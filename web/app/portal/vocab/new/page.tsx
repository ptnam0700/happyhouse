'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { createCollection } from '../actions'

const COLORS = ['#4F46E5','#E91E63','#FB8C00','#10B981','#0EA5E9','#9C27B0','#E8303A','#F59E0B','#14B8A6','#6366F1']

export default function NewCollectionPage() {
  const router = useRouter()
  const [name, setName]   = useState('')
  const [desc, setDesc]   = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [, startTransition] = useTransition()

  const handleSubmit = async () => {
    if (!name.trim()) return
    // get student id
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/portal/login'); return }
    const { createServiceClient } = await import('@/lib/supabase/service')
    const db = createServiceClient()
    const { data: s } = await db.from('school_students').select('id').eq('auth_user_id', user.id).single()
    if (!s) return
    startTransition(() => createCollection(s.id, { name, description: desc, color }))
  }

  return (
    <div className="min-h-screen bg-[#F7F6F2]">
      <header className="bg-[#1A2744] px-4 sm:px-6 py-4 flex items-center gap-3">
        <Link href="/portal/vocab" className="text-white/70 hover:text-white text-sm font-medium transition-colors">← Bộ từ vựng</Link>
        <span className="text-white font-bold">Tạo bộ mới</span>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(26,39,68,0.08)] space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tên bộ từ *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="VD: IELTS Academic Words"
              className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm text-[#1A2744] focus:outline-none focus:border-[#E8303A]" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Mô tả</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2} placeholder="Ghi chú về bộ từ này..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-[#1A2744] resize-none focus:outline-none focus:border-[#E8303A]" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Màu sắc</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)}
                  style={{ background: c }}
                  className={`w-8 h-8 rounded-full transition-transform ${color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'}`} />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-xl overflow-hidden flex border border-gray-100">
            <div style={{ background: color }} className="w-3" />
            <div className="px-4 py-3">
              <div className="font-bold text-[#1A2744] text-sm">{name || 'Tên bộ từ vựng'}</div>
              {desc && <div className="text-xs text-gray-400 mt-0.5">{desc}</div>}
            </div>
          </div>

          <button onClick={handleSubmit} disabled={!name.trim()}
            className="w-full h-11 bg-[#E8303A] hover:bg-[#C0222B] text-white font-bold rounded-xl transition-colors disabled:opacity-40">
            Tạo bộ từ vựng →
          </button>
        </div>
      </div>
    </div>
  )
}
