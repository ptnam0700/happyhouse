'use client'

import { useState, useTransition } from 'react'
import { use } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Trash2, Users, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { updateClass, deleteClass } from '../../actions'
import { cn } from '@/lib/utils'
import { useEffect } from 'react'

const LEVELS   = ['A1','A2','B1','B2','C1','C2','Starters','Movers','Flyers']
const STATUSES = [{ v: 'upcoming', l: 'Sắp khai giảng' }, { v: 'active', l: 'Đang học' }, { v: 'completed', l: 'Đã kết thúc' }, { v: 'cancelled', l: 'Đã huỷ' }]
const STATUS_STYLE: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700', upcoming: 'bg-blue-100 text-blue-700',
  completed: 'bg-gray-100 text-gray-500',    cancelled: 'bg-red-100 text-red-500',
}

export default function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [cls,      setCls]      = useState<any>(null)
  const [students, setStudents] = useState<any[]>([])
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [, startTransition]     = useTransition()

  // Form fields
  const [name, setName] = useState('')
  const [level, setLevel] = useState('')
  const [teacher, setTeacher] = useState('')
  const [room, setRoom] = useState('')
  const [schedule, setSchedule] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [maxStudents, setMaxStudents] = useState('15')
  const [status, setStatus] = useState('active')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    const db = createClient()
    Promise.all([
      db.from('classes' as any).select('*').eq('id', id).single(),
      db.from('school_students' as any).select('id, full_name, phone, status, enrollment_date').eq('class_id', id).order('full_name'),
    ]).then(([{ data: c }, { data: s }]) => {
      if (c) {
        setCls(c); setName(c.name); setLevel(c.level ?? ''); setTeacher(c.teacher ?? '')
        setRoom(c.room ?? ''); setSchedule(c.schedule ?? ''); setStartDate(c.start_date ?? '')
        setEndDate(c.end_date ?? ''); setMaxStudents(String(c.max_students ?? 15))
        setStatus(c.status); setNotes(c.notes ?? '')
      }
      setStudents(s ?? [])
      setLoading(false)
    })
  }, [id])

  const handleSave = async () => {
    setSaving(true)
    const fd = new FormData()
    fd.set('name', name); fd.set('level', level); fd.set('teacher', teacher)
    fd.set('room', room); fd.set('schedule', schedule); fd.set('start_date', startDate)
    fd.set('end_date', endDate); fd.set('max_students', maxStudents)
    fd.set('status', status); fd.set('notes', notes)
    try { await updateClass(id, fd); toast.success('Đã lưu') }
    catch (e: any) { toast.error(e.message) }
    setSaving(false)
  }

  const handleDelete = () => {
    if (!confirm('Xoá lớp này? Học viên trong lớp sẽ không bị xoá.')) return
    startTransition(() => deleteClass(id))
  }

  if (loading) return <div className="p-8 text-gray-400 text-sm">Đang tải...</div>

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-gray-100 bg-white flex items-center gap-3 flex-wrap">
        <Link href="/admin/school/classes" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#1A2744] transition-colors">
          <ChevronLeft size={16} /> Lớp học
        </Link>
        <span className="text-base font-bold text-[#1A2744] flex-1">{cls?.name}</span>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[status] ?? 'bg-gray-100'}`}>{STATUSES.find(s => s.v === status)?.l}</span>
        <Button variant="outline" onClick={handleDelete} className="h-8 px-3 rounded-xl border-red-200 text-red-500 hover:bg-red-50 text-xs"><Trash2 size={13} className="mr-1" />Xoá</Button>
        <Button onClick={handleSave} disabled={saving} className="h-8 px-4 rounded-xl bg-[#1A2744] hover:bg-[#243461] text-white border-0 text-xs">{saving ? 'Lưu...' : 'Lưu'}</Button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="flex flex-col lg:flex-row gap-4 p-4 sm:p-6">
          {/* Left: class info */}
          <div className="lg:w-80 shrink-0 space-y-3">
            <div className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(26,39,68,0.08)] space-y-3">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Thông tin lớp</h2>
              {[
                { label: 'Tên lớp', val: name, set: setName, placeholder: 'IELTS Foundation A' },
                { label: 'Giáo viên', val: teacher, set: setTeacher, placeholder: 'Tên giáo viên' },
                { label: 'Phòng học', val: room, set: setRoom, placeholder: 'Phòng 201' },
                { label: 'Lịch học', val: schedule, set: setSchedule, placeholder: 'T2-T4 18:00–20:00' },
              ].map(f => (
                <div key={f.label} className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">{f.label}</label>
                  <Input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.placeholder} className="h-9 border-gray-200 rounded-xl text-sm focus-visible:border-[#E8303A] focus-visible:ring-0" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Cấp độ</label>
                  <select value={level} onChange={e => setLevel(e.target.value)} className="w-full h-9 rounded-xl border border-gray-200 bg-white px-2.5 text-sm focus:outline-none focus:border-[#E8303A]">
                    <option value="">—</option>
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Sĩ số tối đa</label>
                  <Input value={maxStudents} onChange={e => setMaxStudents(e.target.value)} type="number" className="h-9 border-gray-200 rounded-xl text-sm focus-visible:border-[#E8303A] focus-visible:ring-0" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Khai giảng</label>
                  <Input value={startDate} onChange={e => setStartDate(e.target.value)} type="date" className="h-9 border-gray-200 rounded-xl text-sm focus-visible:border-[#E8303A] focus-visible:ring-0" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Kết thúc</label>
                  <Input value={endDate} onChange={e => setEndDate(e.target.value)} type="date" className="h-9 border-gray-200 rounded-xl text-sm focus-visible:border-[#E8303A] focus-visible:ring-0" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Trạng thái</label>
                <select value={status} onChange={e => setStatus(e.target.value)} className="w-full h-9 rounded-xl border border-gray-200 bg-white px-2.5 text-sm focus:outline-none focus:border-[#E8303A]">
                  {STATUSES.map(s => <option key={s.v} value={s.v}>{s.l}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Ghi chú</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm resize-none focus:outline-none focus:border-[#E8303A]" />
              </div>
            </div>
          </div>

          {/* Right: students */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-[#1A2744]">
                Học viên <span className="text-gray-400 font-normal">({students.length})</span>
              </h2>
              <Link href={`/admin/school/students/new?class_id=${id}`}
                className="flex items-center gap-1.5 h-8 px-3 rounded-xl bg-[#E8303A] hover:bg-[#C0222B] text-white text-xs font-semibold transition-colors">
                <UserPlus size={13} /> Thêm học viên
              </Link>
            </div>
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(26,39,68,0.08)] overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/80 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Học viên</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden sm:table-cell">Ngày nhập học</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Trạng thái</th>
                    <th className="px-3 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {students.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-3">
                        <div className="font-semibold text-[#1A2744]">{s.full_name}</div>
                        {s.phone && <div className="text-xs text-gray-400">{s.phone}</div>}
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-400 hidden sm:table-cell">
                        {s.enrollment_date ? new Date(s.enrollment_date).toLocaleDateString('vi-VN') : '—'}
                      </td>
                      <td className="px-3 py-3">
                        <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full',
                          s.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                          s.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
                          s.status === 'graduated' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-500')}>
                          {s.status === 'active' ? 'Đang học' : s.status === 'paused' ? 'Tạm dừng' : s.status === 'graduated' ? 'Tốt nghiệp' : 'Nghỉ học'}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <Link href={`/admin/school/students/${s.id}`} className="text-xs text-[#E8303A] hover:underline">Chi tiết</Link>
                      </td>
                    </tr>
                  ))}
                  {!students.length && (
                    <tr><td colSpan={4} className="px-5 py-12 text-center text-gray-400 text-sm">Chưa có học viên trong lớp này</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
