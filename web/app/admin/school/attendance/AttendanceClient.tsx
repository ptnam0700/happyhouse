'use client'

import { useState, useEffect, useTransition } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { upsertAttendance } from '../actions'
import { cn } from '@/lib/utils'
import { Save, ChevronLeft, ChevronRight } from 'lucide-react'

interface Cls { id: string; name: string; level: string | null; teacher: string | null }
interface Student { id: string; full_name: string; phone: string | null }

type AttStatus = 'present' | 'absent' | 'late' | 'excused'

const ATT: { v: AttStatus; l: string; color: string; short: string }[] = [
  { v: 'present', l: 'Có mặt',  color: 'bg-emerald-500 text-white', short: '✓'  },
  { v: 'late',    l: 'Đi muộn', color: 'bg-yellow-400 text-white',  short: '⏰' },
  { v: 'excused', l: 'Phép',    color: 'bg-blue-400 text-white',    short: '📝' },
  { v: 'absent',  l: 'Vắng',   color: 'bg-red-400 text-white',     short: '✗'  },
]

function today() { return new Date().toISOString().slice(0, 10) }
function fmtDate(d: string) {
  const dt = new Date(d + 'T00:00:00')
  return dt.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
}
function shiftDate(d: string, days: number) {
  const dt = new Date(d + 'T00:00:00')
  dt.setDate(dt.getDate() + days)
  return dt.toISOString().slice(0, 10)
}

export function AttendanceClient({ classes }: { classes: Cls[] }) {
  const [classId,   setClassId]   = useState(classes[0]?.id ?? '')
  const [date,      setDate]      = useState(today())
  const [students,  setStudents]  = useState<Student[]>([])
  const [records,   setRecords]   = useState<Record<string, AttStatus>>({})
  const [loading,   setLoading]   = useState(false)
  const [, startTransition]       = useTransition()

  useEffect(() => {
    if (!classId) return
    setLoading(true)
    const db = createClient()
    Promise.all([
      db.from('school_students' as any).select('id, full_name, phone').eq('class_id', classId).eq('status', 'active').order('full_name'),
      db.from('attendance' as any).select('student_id, status').eq('class_id', classId).eq('session_date', date),
    ]).then(([{ data: s }, { data: a }]) => {
      setStudents((s ?? []) as Student[])
      const map: Record<string, AttStatus> = {}
      ;(a ?? []).forEach((r: any) => { map[r.student_id] = r.status })
      // Default to 'present' for new sessions
      ;(s ?? []).forEach((st: any) => { if (!map[st.id]) map[st.id] = 'present' })
      setRecords(map)
      setLoading(false)
    })
  }, [classId, date])

  const setAll = (status: AttStatus) => setRecords(prev => Object.fromEntries(Object.keys(prev).map(k => [k, status])))

  const handleSave = () => {
    if (!students.length) { toast.error('Không có học viên'); return }
    startTransition(async () => {
      try {
        await upsertAttendance(classId, date, students.map(s => ({ student_id: s.id, status: records[s.id] ?? 'present' })))
        toast.success(`Đã lưu điểm danh ${fmtDate(date)}`)
      } catch { toast.error('Lỗi lưu điểm danh') }
    })
  }

  const currentClass = classes.find(c => c.id === classId)
  const counts = ATT.map(a => ({ ...a, count: Object.values(records).filter(v => v === a.v).length }))

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-gray-100 bg-white flex flex-wrap gap-3 items-center">
        <h1 className="text-base font-bold text-[#1A2744]">Điểm danh</h1>

        <select value={classId} onChange={e => setClassId(e.target.value)}
          className="h-9 rounded-xl border border-gray-200 bg-white px-3 text-sm text-[#1A2744] focus:outline-none focus:border-[#E8303A] min-w-[180px]">
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}{c.level ? ` (${c.level})` : ''}</option>)}
          {!classes.length && <option value="">Không có lớp active</option>}
        </select>

        {/* Date navigator */}
        <div className="flex items-center gap-1">
          <button onClick={() => setDate(d => shiftDate(d, -1))} className="w-8 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:border-gray-300 hover:text-[#1A2744] transition-colors"><ChevronLeft size={15} /></button>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} max={today()}
            className="h-9 rounded-xl border border-gray-200 bg-white px-3 text-sm text-[#1A2744] focus:outline-none focus:border-[#E8303A]" />
          <button onClick={() => setDate(d => shiftDate(d, 1))} disabled={date >= today()} className="w-8 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:border-gray-300 hover:text-[#1A2744] disabled:opacity-30 transition-colors"><ChevronRight size={15} /></button>
          <button onClick={() => setDate(today())} className="text-xs font-semibold text-[#E8303A] hover:underline ml-1">Hôm nay</button>
        </div>

        <button onClick={handleSave} disabled={!students.length}
          className="ml-auto flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[#E8303A] hover:bg-[#C0222B] text-white text-sm font-semibold transition-colors disabled:opacity-40">
          <Save size={14} /> Lưu điểm danh
        </button>
      </div>

      {/* Summary + quick actions */}
      {students.length > 0 && (
        <div className="shrink-0 px-4 sm:px-6 py-2 border-b border-gray-50 bg-[#F7F6F2] flex flex-wrap items-center gap-3">
          <div className="flex gap-3">
            {counts.map(a => (
              <span key={a.v} className="text-xs font-semibold text-gray-500">
                {a.short} <span className="text-[#1A2744]">{a.count}</span>
              </span>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-400">Đánh dấu tất cả:</span>
            {ATT.map(a => (
              <button key={a.v} onClick={() => setAll(a.v)}
                className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-all ${a.color} opacity-80 hover:opacity-100`}>
                {a.short} {a.l}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Student list */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Đang tải...</div>
        ) : !students.length ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            {!classId ? 'Chọn lớp để điểm danh' : 'Lớp này chưa có học viên active'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-white shadow-[0_1px_0_0_#e5e7eb]">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide w-8">#</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Học viên</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {students.map((s, i) => {
                const cur = records[s.id] ?? 'present'
                const att = ATT.find(a => a.v === cur)!
                return (
                  <tr key={s.id} className={cn('transition-colors', cur === 'absent' ? 'bg-red-50/30' : cur === 'late' ? 'bg-yellow-50/30' : cur === 'excused' ? 'bg-blue-50/20' : '')}>
                    <td className="px-5 py-3 text-xs text-gray-300 font-mono">{i + 1}</td>
                    <td className="px-3 py-3">
                      <div className="font-semibold text-[#1A2744]">{s.full_name}</div>
                      {s.phone && <div className="text-xs text-gray-400">{s.phone}</div>}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        {ATT.map(a => (
                          <button key={a.v} onClick={() => setRecords(prev => ({ ...prev, [s.id]: a.v }))}
                            className={cn(
                              'px-3 py-1.5 rounded-xl text-xs font-semibold transition-all',
                              cur === a.v ? `${a.color} shadow-sm scale-105` : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                            )}>
                            {a.short} {a.l}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
