'use client'

import { useState, useEffect, useTransition, use } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { updateSchoolStudent, deleteSchoolStudent } from '../../actions'
import { cn } from '@/lib/utils'

const STATUS_OPTIONS = [
  { v: 'active', l: 'Đang học' }, { v: 'paused', l: 'Tạm dừng' },
  { v: 'graduated', l: 'Tốt nghiệp' }, { v: 'dropped', l: 'Nghỉ học' },
]
const ATT_STYLE: Record<string, string> = {
  present: 'bg-emerald-100 text-emerald-700', late: 'bg-yellow-100 text-yellow-700',
  excused: 'bg-blue-100 text-blue-700', absent: 'bg-red-100 text-red-600',
}
const ATT_LABEL: Record<string, string> = { present: 'Có mặt', late: 'Muộn', excused: 'Phép', absent: 'Vắng' }

export default function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [student,    setStudent]    = useState<any>(null)
  const [attendance, setAttendance] = useState<any[]>([])
  const [classes,    setClasses]    = useState<any[]>([])
  const [loading,    setLoading]    = useState(true)
  const [saving,     setSaving]     = useState(false)
  const [, startTransition]         = useTransition()

  const [fullName,       setFullName]       = useState('')
  const [phone,          setPhone]          = useState('')
  const [email,          setEmail]          = useState('')
  const [dob,            setDob]            = useState('')
  const [parentName,     setParentName]     = useState('')
  const [parentPhone,    setParentPhone]    = useState('')
  const [classId,        setClassId]        = useState('')
  const [enrollmentDate, setEnrollmentDate] = useState('')
  const [status,         setStatus]         = useState('active')
  const [notes,          setNotes]          = useState('')

  useEffect(() => {
    const db = createClient()
    Promise.all([
      db.from('school_students' as any).select('*, classes(name)').eq('id', id).single(),
      db.from('attendance' as any).select('session_date, status, notes, classes(name)').eq('student_id', id).order('session_date', { ascending: false }).limit(30),
      db.from('classes' as any).select('id, name').in('status', ['upcoming','active']).order('name'),
    ]).then(([{ data: s }, { data: a }, { data: c }]) => {
      if (s) {
        setStudent(s)
        setFullName(s.full_name); setPhone(s.phone ?? ''); setEmail(s.email ?? '')
        setDob(s.date_of_birth ?? ''); setParentName(s.parent_name ?? ''); setParentPhone(s.parent_phone ?? '')
        setClassId(s.class_id ?? ''); setEnrollmentDate(s.enrollment_date ?? ''); setStatus(s.status); setNotes(s.notes ?? '')
      }
      setAttendance(a ?? [])
      setClasses(c ?? [])
      setLoading(false)
    })
  }, [id])

  const handleSave = async () => {
    setSaving(true)
    const fd = new FormData()
    fd.set('full_name', fullName); fd.set('phone', phone); fd.set('email', email)
    fd.set('date_of_birth', dob); fd.set('parent_name', parentName); fd.set('parent_phone', parentPhone)
    fd.set('class_id', classId); fd.set('enrollment_date', enrollmentDate); fd.set('status', status); fd.set('notes', notes)
    try { await updateSchoolStudent(id, fd); toast.success('Đã lưu') }
    catch (e: any) { toast.error(e.message) }
    setSaving(false)
  }

  const handleDelete = () => {
    if (!confirm(`Xoá học viên "${student?.full_name}"?`)) return
    startTransition(() => deleteSchoolStudent(id))
  }

  if (loading) return <div className="p-8 text-gray-400 text-sm">Đang tải...</div>

  const cls = Array.isArray(student?.classes) ? student.classes[0] : student?.classes
  const presentCount = attendance.filter(a => a.status === 'present' || a.status === 'late').length

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-gray-100 bg-white flex items-center gap-3 flex-wrap">
        <Link href="/admin/school/students" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#1A2744] transition-colors">
          <ChevronLeft size={16} /> Học viên
        </Link>
        <span className="text-base font-bold text-[#1A2744] flex-1">{student?.full_name}</span>
        <Button variant="outline" onClick={handleDelete} className="h-8 px-3 rounded-xl border-red-200 text-red-500 hover:bg-red-50 text-xs"><Trash2 size={13} className="mr-1" />Xoá</Button>
        <Button onClick={handleSave} disabled={saving} className="h-8 px-4 rounded-xl bg-[#1A2744] hover:bg-[#243461] text-white border-0 text-xs">{saving ? 'Lưu...' : 'Lưu'}</Button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="flex flex-col lg:flex-row gap-4 p-4 sm:p-6">
          {/* Left: info */}
          <div className="lg:w-80 shrink-0 space-y-3">
            <div className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(26,39,68,0.08)] space-y-3">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Thông tin học viên</h2>
              {[
                { l: 'Họ và tên', v: fullName, s: setFullName },
                { l: 'Số điện thoại', v: phone, s: setPhone },
                { l: 'Email', v: email, s: setEmail },
                { l: 'Ngày sinh', v: dob, s: setDob, type: 'date' },
                { l: 'Ngày nhập học', v: enrollmentDate, s: setEnrollmentDate, type: 'date' },
              ].map(f => (
                <div key={f.l} className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">{f.l}</label>
                  <Input value={f.v} onChange={e => f.s(e.target.value)} type={f.type ?? 'text'}
                    className="h-9 border-gray-200 rounded-xl text-sm focus-visible:border-[#E8303A] focus-visible:ring-0" />
                </div>
              ))}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Trạng thái</label>
                <select value={status} onChange={e => setStatus(e.target.value)} className="w-full h-9 rounded-xl border border-gray-200 bg-white px-2.5 text-sm focus:outline-none focus:border-[#E8303A]">
                  {STATUS_OPTIONS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Lớp học</label>
                <select value={classId} onChange={e => setClassId(e.target.value)} className="w-full h-9 rounded-xl border border-gray-200 bg-white px-2.5 text-sm focus:outline-none focus:border-[#E8303A]">
                  <option value="">— Chưa xếp lớp —</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(26,39,68,0.08)] space-y-3">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Phụ huynh</h2>
              {[
                { l: 'Tên phụ huynh', v: parentName, s: setParentName },
                { l: 'SĐT phụ huynh', v: parentPhone, s: setParentPhone },
              ].map(f => (
                <div key={f.l} className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">{f.l}</label>
                  <Input value={f.v} onChange={e => f.s(e.target.value)} className="h-9 border-gray-200 rounded-xl text-sm focus-visible:border-[#E8303A] focus-visible:ring-0" />
                </div>
              ))}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Ghi chú</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm resize-none focus:outline-none focus:border-[#E8303A]" />
              </div>
            </div>
          </div>

          {/* Right: attendance */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-[#1A2744]">Lịch sử điểm danh</h2>
              {attendance.length > 0 && (
                <span className="text-xs text-gray-400">{presentCount}/{attendance.length} buổi có mặt ({Math.round(presentCount/attendance.length*100)}%)</span>
              )}
            </div>
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(26,39,68,0.08)] overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/80 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Ngày</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden sm:table-cell">Lớp</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {attendance.map((a, i) => {
                    const cls = Array.isArray(a.classes) ? a.classes[0] : a.classes
                    return (
                      <tr key={i} className="hover:bg-gray-50/50">
                        <td className="px-5 py-3 text-sm text-[#1A2744]">{new Date(a.session_date + 'T00:00:00').toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })}</td>
                        <td className="px-3 py-3 text-xs text-gray-400 hidden sm:table-cell">{cls?.name ?? '—'}</td>
                        <td className="px-3 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ATT_STYLE[a.status] ?? 'bg-gray-100'}`}>{ATT_LABEL[a.status] ?? a.status}</span>
                        </td>
                      </tr>
                    )
                  })}
                  {!attendance.length && <tr><td colSpan={3} className="px-5 py-12 text-center text-gray-400 text-sm">Chưa có buổi điểm danh nào</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
