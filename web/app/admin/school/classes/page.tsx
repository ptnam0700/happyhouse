import Link from 'next/link'
import { Plus, Users, CalendarDays } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/service'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Lớp học' }

const STATUS_STYLE: Record<string, string> = {
  upcoming:  'bg-blue-100 text-blue-700',
  active:    'bg-emerald-100 text-emerald-700',
  completed: 'bg-gray-100 text-gray-500',
  cancelled: 'bg-red-100 text-red-500',
}
const STATUS_LABEL: Record<string, string> = {
  upcoming: 'Sắp khai giảng', active: 'Đang học', completed: 'Đã kết thúc', cancelled: 'Đã huỷ',
}

export default async function ClassesPage() {
  const db = createServiceClient()
  const [{ data: classes }, { data: studentCounts }] = await Promise.all([
    db.from('classes').select('id, name, level, teacher, schedule, room, max_students, start_date, end_date, status').order('created_at', { ascending: false }),
    db.from('student_classes').select('class_id').eq('status', 'active'),
  ])

  const countMap: Record<string, number> = {}
  studentCounts?.forEach((s: any) => { countMap[s.class_id] = (countMap[s.class_id] ?? 0) + 1 })

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-gray-100 bg-white flex items-center gap-2">
        <span className="text-base font-bold text-[#1A2744] mr-auto">Lớp học</span>
        <Link href="/admin/school/classes/new"
          className="flex items-center gap-1.5 h-8 px-3 rounded-xl bg-[#E8303A] hover:bg-[#C0222B] text-white text-xs font-semibold transition-colors">
          <Plus size={13} /> Tạo lớp
        </Link>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {classes?.map(c => {
            const enrolled = countMap[c.id] ?? 0
            const pct = c.max_students ? Math.round((enrolled / c.max_students) * 100) : 0
            return (
              <Link key={c.id} href={`/admin/school/classes/${c.id}`}
                className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(26,39,68,0.08)] hover:shadow-md transition-all flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-[#1A2744] leading-tight">{c.name}</h3>
                    {c.level && <span className="text-xs text-gray-400">{c.level}</span>}
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${STATUS_STYLE[c.status] ?? 'bg-gray-100 text-gray-500'}`}>
                    {STATUS_LABEL[c.status] ?? c.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-gray-500">
                  {c.teacher  && <div className="flex items-center gap-1.5">👨‍🏫 {c.teacher}</div>}
                  {c.schedule && <div className="flex items-center gap-1.5">🕐 {c.schedule}</div>}
                  {c.room     && <div className="flex items-center gap-1.5">📍 {c.room}</div>}
                  {(c.start_date || c.end_date) && (
                    <div className="flex items-center gap-1.5">
                      <CalendarDays size={11} />
                      {c.start_date && new Date(c.start_date).toLocaleDateString('vi-VN')}
                      {c.start_date && c.end_date && ' – '}
                      {c.end_date && new Date(c.end_date).toLocaleDateString('vi-VN')}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="flex items-center gap-1 text-gray-500"><Users size={11} /> {enrolled} / {c.max_students} học viên</span>
                    <span className="text-gray-400">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${pct >= 90 ? 'bg-red-400' : pct >= 70 ? 'bg-yellow-400' : 'bg-emerald-500'}`}
                      style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </Link>
            )
          })}
          {!classes?.length && (
            <div className="col-span-3 text-center py-16 text-gray-400 text-sm">Chưa có lớp học nào</div>
          )}
        </div>
      </div>
    </div>
  )
}
