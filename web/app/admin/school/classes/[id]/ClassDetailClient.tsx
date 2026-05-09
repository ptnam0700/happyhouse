'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { ChevronLeft, Trash2, UserPlus, ClipboardList, X, Search, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { updateClass, deleteClass, assignTestToClass, removeTestFromClass, addStudentToClass, removeStudentFromClass } from '../../actions'
import { cn } from '@/lib/utils'

interface Cls {
  id: string; name: string; level: string | null; teacher: string | null
  schedule: string | null; room: string | null; max_students: number | null
  start_date: string | null; end_date: string | null; status: string; notes: string | null
}
interface Student { id: string; full_name: string; phone: string | null; status: string; enrollment_date: string | null }
interface AssignedTest { test_id: string; test_name: string; due_date: string | null }
interface AvailableTest { id: string; name: string }
interface AvailableStudent { id: string; full_name: string; phone: string | null }

const LEVELS   = ['A1','A2','B1','B2','C1','C2','Starters','Movers','Flyers']
const STATUSES = [
  { v: 'upcoming', l: 'Sắp khai giảng' }, { v: 'active',    l: 'Đang học'      },
  { v: 'completed', l: 'Đã kết thúc'   }, { v: 'cancelled', l: 'Đã huỷ'        },
]
const STATUS_STYLE: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700', upcoming: 'bg-blue-100 text-blue-700',
  completed: 'bg-gray-100 text-gray-500',    cancelled: 'bg-red-100 text-red-500',
}
const STU_STATUS: Record<string, string> = {
  active: 'Đang học', paused: 'Tạm dừng', graduated: 'Tốt nghiệp', dropped: 'Nghỉ học',
}
const STU_STYLE: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700', paused: 'bg-yellow-100 text-yellow-700',
  graduated: 'bg-blue-100 text-blue-700',    dropped: 'bg-gray-100 text-gray-500',
}

export function ClassDetailClient({ cls, students: initialStudents, assignedTests: initialAssigned, availableTests, availableStudents }: {
  cls: Cls; students: Student[]
  assignedTests: AssignedTest[]; availableTests: AvailableTest[]
  availableStudents: AvailableStudent[]
}) {
  const [saving,         setSaving]         = useState(false)
  const [students,       setStudents]       = useState(initialStudents)
  const [assigned,       setAssigned]       = useState(initialAssigned)
  const [pickTestId,     setPickTestId]     = useState('')
  const [pickDueDate,    setPickDueDate]    = useState('')
  const [stuPickerOpen,  setStuPickerOpen]  = useState(false)
  const [stuSearch,      setStuSearch]      = useState('')
  const [, startTransition]                = useTransition()

  const [name,        setName]        = useState(cls.name)
  const [level,       setLevel]       = useState(cls.level ?? '')
  const [teacher,     setTeacher]     = useState(cls.teacher ?? '')
  const [room,        setRoom]        = useState(cls.room ?? '')
  const [schedule,    setSchedule]    = useState(cls.schedule ?? '')
  const [startDate,   setStartDate]   = useState(cls.start_date ?? '')
  const [endDate,     setEndDate]     = useState(cls.end_date ?? '')
  const [maxStudents, setMaxStudents] = useState(String(cls.max_students ?? 15))
  const [status,      setStatus]      = useState(cls.status)
  const [notes,       setNotes]       = useState(cls.notes ?? '')

  const handleSave = async () => {
    setSaving(true)
    const fd = new FormData()
    fd.set('name', name); fd.set('level', level); fd.set('teacher', teacher)
    fd.set('room', room); fd.set('schedule', schedule); fd.set('start_date', startDate)
    fd.set('end_date', endDate); fd.set('max_students', maxStudents)
    fd.set('status', status); fd.set('notes', notes)
    try { await updateClass(cls.id, fd); toast.success('Đã lưu lớp') }
    catch (e: any) { toast.error(e.message) }
    setSaving(false)
  }

  const handleDelete = () => {
    if (!confirm('Xoá lớp này? Học viên trong lớp sẽ không bị xoá.')) return
    startTransition(() => deleteClass(cls.id))
  }

  const enrolled    = students.filter(s => s.status === 'active').length
  const pct         = cls.max_students ? Math.round((enrolled / cls.max_students) * 100) : 0

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-gray-100 bg-white flex items-center gap-3 flex-wrap">
        <Link href="/admin/school/classes" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#1A2744] transition-colors">
          <ChevronLeft size={16} /> Lớp học
        </Link>
        <span className="text-base font-bold text-[#1A2744] flex-1 truncate">{name}</span>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[status] ?? 'bg-gray-100'}`}>
          {STATUSES.find(s => s.v === status)?.l ?? status}
        </span>
        <Button variant="outline" onClick={handleDelete}
          className="h-8 px-3 rounded-xl border-red-200 text-red-500 hover:bg-red-50 text-xs">
          <Trash2 size={13} className="mr-1" /> Xoá
        </Button>
        <Button onClick={handleSave} disabled={saving}
          className="h-8 px-4 rounded-xl bg-[#1A2744] hover:bg-[#243461] text-white border-0 text-xs">
          {saving ? 'Đang lưu...' : 'Lưu'}
        </Button>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="flex flex-col lg:flex-row gap-4 p-4 sm:p-6">

          {/* LEFT: class info */}
          <div className="lg:w-80 shrink-0 space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(26,39,68,0.08)] space-y-3">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Thông tin lớp</h2>
              {[
                { l: 'Tên lớp',  v: name,     s: setName,     p: 'IELTS Foundation A' },
                { l: 'Giáo viên', v: teacher,  s: setTeacher,  p: 'Tên giáo viên'     },
                { l: 'Phòng học', v: room,     s: setRoom,     p: 'Phòng 201'         },
                { l: 'Lịch học',  v: schedule, s: setSchedule, p: 'T2-T4 18:00–20:00' },
              ].map(f => (
                <div key={f.l} className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">{f.l}</label>
                  <Input value={f.v} onChange={e => f.s(e.target.value)} placeholder={f.p}
                    className="h-9 border-gray-200 rounded-xl text-sm focus-visible:border-[#E8303A] focus-visible:ring-0" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Cấp độ</label>
                  <select value={level} onChange={e => setLevel(e.target.value)}
                    className="w-full h-9 rounded-xl border border-gray-200 bg-white px-2.5 text-sm focus:outline-none focus:border-[#E8303A]">
                    <option value="">—</option>
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Sĩ số tối đa</label>
                  <Input value={maxStudents} onChange={e => setMaxStudents(e.target.value)} type="number"
                    className="h-9 border-gray-200 rounded-xl text-sm focus-visible:border-[#E8303A] focus-visible:ring-0" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Khai giảng</label>
                  <Input value={startDate} onChange={e => setStartDate(e.target.value)} type="date"
                    className="h-9 border-gray-200 rounded-xl text-sm focus-visible:border-[#E8303A] focus-visible:ring-0" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Kết thúc</label>
                  <Input value={endDate} onChange={e => setEndDate(e.target.value)} type="date"
                    className="h-9 border-gray-200 rounded-xl text-sm focus-visible:border-[#E8303A] focus-visible:ring-0" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Trạng thái</label>
                <select value={status} onChange={e => setStatus(e.target.value)}
                  className="w-full h-9 rounded-xl border border-gray-200 bg-white px-2.5 text-sm focus:outline-none focus:border-[#E8303A]">
                  {STATUSES.map(s => <option key={s.v} value={s.v}>{s.l}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Ghi chú</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm resize-none focus:outline-none focus:border-[#E8303A]" />
              </div>
            </div>

            {/* Test assignment */}
            <div className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(26,39,68,0.08)] space-y-3">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                <ClipboardList size={13} /> Bài test được giao
              </h2>

              {/* Assigned list */}
              {assigned.map(t => (
                <div key={t.test_id} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                  <span className="flex-1 text-xs font-medium text-[#1A2744] truncate">{t.test_name}</span>
                  {t.due_date && <span className="text-[0.65rem] text-gray-400 shrink-0">{new Date(t.due_date+'T00:00:00').toLocaleDateString('vi-VN')}</span>}
                  <button onClick={() => {
                    startTransition(async () => {
                      await removeTestFromClass(cls.id, t.test_id)
                      setAssigned(prev => prev.filter(x => x.test_id !== t.test_id))
                      toast.info('Đã gỡ bài test')
                    })
                  }} className="text-gray-300 hover:text-red-400 transition-colors shrink-0">
                    <X size={13} />
                  </button>
                </div>
              ))}

              {/* Assign new */}
              <div className="flex gap-2 flex-wrap">
                <select value={pickTestId} onChange={e => setPickTestId(e.target.value)}
                  className="flex-1 min-w-[140px] h-8 rounded-xl border border-gray-200 bg-white px-2.5 text-xs text-[#1A2744] focus:outline-none focus:border-[#E8303A]">
                  <option value="">— Chọn bài test —</option>
                  {availableTests.filter(t => !assigned.find(a => a.test_id === t.id)).map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <Input value={pickDueDate} onChange={e => setPickDueDate(e.target.value)}
                  type="date" placeholder="Hạn nộp"
                  className="w-32 h-8 border-gray-200 rounded-xl text-xs focus-visible:border-[#E8303A] focus-visible:ring-0" />
                <Button onClick={() => {
                  if (!pickTestId) { toast.error('Chọn bài test'); return }
                  const test = availableTests.find(t => t.id === pickTestId)!
                  startTransition(async () => {
                    await assignTestToClass(cls.id, pickTestId, pickDueDate)
                    setAssigned(prev => [...prev, { test_id: pickTestId, test_name: test.name, due_date: pickDueDate || null }])
                    setPickTestId(''); setPickDueDate('')
                    toast.success('Đã giao bài test')
                  })
                }} className="h-8 px-3 rounded-xl bg-[#E8303A] hover:bg-[#C0222B] text-white border-0 text-xs">
                  Giao bài
                </Button>
              </div>
            </div>

            {/* Enrollment bar */}
            <div className="bg-white rounded-2xl p-4 shadow-[0_2px_8px_rgba(26,39,68,0.08)]">
              <div className="flex justify-between text-xs mb-2">
                <span className="font-semibold text-[#1A2744]">{enrolled} / {cls.max_students ?? '?'} học viên đang học</span>
                <span className="text-gray-400">{pct}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={cn('h-full rounded-full', pct >= 90 ? 'bg-red-400' : pct >= 70 ? 'bg-yellow-400' : 'bg-emerald-500')}
                  style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>

          {/* RIGHT: students */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-[#1A2744]">
                Học viên <span className="text-gray-400 font-normal">({students.length})</span>
              </h2>
              <div className="flex gap-2">
                <button onClick={() => setStuPickerOpen(v => !v)}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-xl bg-[#1A2744] hover:bg-[#243461] text-white text-xs font-semibold transition-colors">
                  <Users size={13} /> Từ danh sách
                </button>
                <Link href={`/admin/school/students/new?class_id=${cls.id}`}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-xl bg-[#E8303A] hover:bg-[#C0222B] text-white text-xs font-semibold transition-colors">
                  <UserPlus size={13} /> Tạo mới
                </Link>
              </div>
            </div>

            {/* Student picker */}
            {stuPickerOpen && (
              <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(26,39,68,0.12)] mb-4 overflow-hidden border border-gray-100">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <span className="text-sm font-bold text-[#1A2744]">Thêm học viên vào lớp</span>
                  <button onClick={() => { setStuPickerOpen(false); setStuSearch('') }}
                    className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
                </div>
                <div className="px-4 py-2.5 border-b border-gray-100">
                  <div className="relative">
                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={stuSearch} onChange={e => setStuSearch(e.target.value)}
                      placeholder="Tìm theo tên hoặc số điện thoại..."
                      className="w-full h-8 pl-7 pr-3 rounded-xl border border-gray-200 bg-gray-50 text-xs placeholder:text-gray-300 focus:outline-none focus:border-[#E8303A]" />
                  </div>
                </div>
                <div className="max-h-60 overflow-y-auto divide-y divide-gray-50">
                  {availableStudents
                    .filter(s => {
                      // exclude already enrolled in this class
                      if (students.some(e => e.id === s.id)) return false
                      const term = stuSearch.trim().toLowerCase()
                      return !term || s.full_name.toLowerCase().includes(term) || (s.phone ?? '').includes(term)
                    })
                    .slice(0, 40)
                    .map(s => (
                      <div key={s.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                        <div>
                          <div className="text-sm font-semibold text-[#1A2744]">{s.full_name}</div>
                          {s.phone && <div className="text-xs text-gray-400">{s.phone}</div>}
                        </div>
                        <button
                          onClick={() => {
                            startTransition(async () => {
                              try {
                                await addStudentToClass(s.id, cls.id)
                                setStudents(prev => [...prev, {
                                  id: s.id, full_name: s.full_name, phone: s.phone,
                                  status: 'active', enrollment_date: new Date().toISOString().slice(0, 10),
                                }])
                                toast.success(`Đã thêm ${s.full_name} vào lớp`)
                              } catch { toast.error('Không thể thêm học viên') }
                            })
                          }}
                          className="text-xs font-semibold text-[#E8303A] hover:text-[#C0222B] bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl transition-colors shrink-0">
                          + Thêm
                        </button>
                      </div>
                    ))}
                  {availableStudents.filter(s => {
                    const term = stuSearch.trim().toLowerCase()
                    return !term || s.full_name.toLowerCase().includes(term) || (s.phone ?? '').includes(term)
                  }).length === 0 && (
                    <p className="text-center py-8 text-xs text-gray-400">
                      {stuSearch ? `Không tìm thấy "${stuSearch}"` : 'Không có học viên nào có thể thêm'}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Students table */}
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(26,39,68,0.08)] overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/80 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Học viên</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden sm:table-cell">Nhập học</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Trạng thái</th>
                    <th className="px-3 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {students.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-5 py-3 cursor-pointer" onClick={() => window.location.href = `/admin/school/students/${s.id}`}>
                        <div className="font-semibold text-[#1A2744]">{s.full_name}</div>
                        {s.phone && <div className="text-xs text-gray-400">{s.phone}</div>}
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-400 hidden sm:table-cell">
                        {s.enrollment_date ? new Date(s.enrollment_date).toLocaleDateString('vi-VN') : '—'}
                      </td>
                      <td className="px-3 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STU_STYLE[s.status] ?? 'bg-gray-100 text-gray-500'}`}>
                          {STU_STATUS[s.status] ?? s.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <button
                          onClick={() => {
                            if (!confirm(`Xoá ${s.full_name} khỏi lớp này?`)) return
                            startTransition(async () => {
                              try {
                                await removeStudentFromClass(s.id, cls.id)
                                setStudents(prev => prev.filter(x => x.id !== s.id))
                                toast.info(`Đã xoá ${s.full_name} khỏi lớp`)
                              } catch { toast.error('Không thể xoá') }
                            })
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all">
                          <X size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!students.length && (
                    <tr><td colSpan={4} className="px-5 py-12 text-center text-gray-400 text-sm">
                      Chưa có học viên trong lớp này
                    </td></tr>
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
