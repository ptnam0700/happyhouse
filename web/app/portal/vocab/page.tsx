import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getCollections } from './actions'
import { Plus, BookOpen, ChevronRight, Gamepad2, Trash2 } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Từ vựng của tôi' }

export default async function VocabPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/portal/login')

  const db = createServiceClient()
  const { data: student } = await db.from('school_students').select('id, full_name').eq('auth_user_id', user.id).single()
  if (!student) redirect('/portal/login')

  const collections = await getCollections(student.id)

  // Word count per collection
  const { data: wordCounts } = collections.length
    ? await db.from('vocab_words').select('collection_id').in('collection_id', collections.map(c => c.id))
    : { data: [] }

  const countMap: Record<string, number> = {}
  ;(wordCounts ?? []).forEach((w: any) => { countMap[w.collection_id] = (countMap[w.collection_id] ?? 0) + 1 })

  return (
    <div className="min-h-screen bg-[#F7F6F2]">
      <header className="bg-[#1A2744] px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/portal" className="flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium transition-colors">
          ← Trang chủ
        </Link>
        <span className="text-white font-bold text-base">📚 Từ vựng của tôi</span>
        <span className="w-20" />
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-[#1A2744]">Bộ từ vựng</h1>
            <p className="text-sm text-gray-400 mt-0.5">{collections.length} bộ · {Object.values(countMap).reduce((a, b) => a + b, 0)} từ</p>
          </div>
          <Link href="/portal/vocab/new"
            className="flex items-center gap-1.5 bg-[#E8303A] hover:bg-[#C0222B] text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors">
            <Plus size={15} /> Tạo bộ mới
          </Link>
        </div>

        {collections.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold text-[#1A2744] mb-1">Chưa có bộ từ vựng nào</p>
            <p className="text-sm mb-5">Tạo bộ đầu tiên và bắt đầu ghi từ mới!</p>
            <Link href="/portal/vocab/new" className="inline-flex items-center gap-2 bg-[#E8303A] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#C0222B] transition-colors">
              <Plus size={16} /> Tạo bộ từ vựng
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {collections.map(c => (
              <div key={c.id} className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(26,39,68,0.08)] overflow-hidden flex">
                {/* Colour strip */}
                <div style={{ background: c.color }} className="w-2 shrink-0" />
                <div className="flex-1 px-5 py-4 flex items-center gap-4 min-w-0">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[#1A2744] truncate">{c.name}</div>
                    {c.description && <div className="text-xs text-gray-400 truncate mt-0.5">{c.description}</div>}
                    <div className="text-xs text-gray-400 mt-1">
                      <span className="font-semibold text-[#1A2744]">{countMap[c.id] ?? 0}</span> từ
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {(countMap[c.id] ?? 0) > 0 && (
                      <Link href={`/portal/vocab/${c.id}/study`}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors">
                        <Gamepad2 size={13} /> Học
                      </Link>
                    )}
                    <Link href={`/portal/vocab/${c.id}`}
                      className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 text-[#1A2744] hover:bg-gray-200 transition-colors">
                      Xem <ChevronRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
