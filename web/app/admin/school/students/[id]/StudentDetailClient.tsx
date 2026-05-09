'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { updateSchoolStudent, deleteSchoolStudent, createStudentAccount, resetStudentPassword, deleteStudentAccount, addStudentToClass, removeStudentFromClass } from '../../actions'
import { cn } from '@/lib/utils'

interface Student {
  id: string; full_name: string; phone: string | null; email: string | null
  date_of_birth: string | null; parent_name: string | null; parent_phone: string | null
  enrollment_date: string | null; status: string; notes: string | null
  auth_user_id: string | null
}
interface StudentClass { class_id: string; class_name: string | null; enrolled_at: string | null; status: string }
interface AttRecord { session_date: string; status: string; notes: string | null; class_name: string | null }
interface Cls { id: string; name: string }

const STATUS_OPTIONS = [
  { v: 'active', l: 'Đang học' }, { v: 'paused', l: 'Tạm dừng' },
  { v: 'graduated', l: 'Tốt nghiệp' }, { v: 'dropped', l: 'Nghỉ học' },
]
const ATT_STYLE: Record<string, string> = {
  present: 'bg-emerald-100 text-emerald-700', late: 'bg-yellow-100 text-yellow-700',
  excused: 'bg-blue-100 text-blue-700',       absent: 'bg-red-100 text-red-600',
}
const ATT_LABEL: Record<string, string> = {
  present: 'Có mặt', late: 'Muộn', excused: 'Phép', absent: 'Vắng',
}

export function StudentDetailClient({ student, studentClasses: initialClasses, attendance, allClasses }: {
  student: Student; studentClasses: StudentClass[]; attendance: AttRecord[]; allClasses: Cls[]
}) {
  const router = useRouter()
  const [saving,         setSaving]         = useState(false)
  const [newPassword,    setNewPassword]    = useState('')
  const [accountSaving,  setAccountSaving]  = useState(false)
  const [, startTransition]                 = useTransition()

  const [fullName,       setFullName]       = useState(student.full_name)
  const [phone,          setPhone]          = useState(student.phone ?? '')
  const [email,          setEmail]          = useState(student.email ?? '')
  const [dob,            setDob]            = useState(student.date_of_birth ?? '')
  const [parentName,     setParentName]     = useState(student.parent_name ?? '')
  const [parentPhone,    setParentPhone]    = useState(student.parent_phone ?? '')
  const [enrollmentDate, setEnrollmentDate] = useState(student.enrollment_date ?? '')
  const [status,         setStatus]         = useState(student.status)
  const [notes,          setNotes]          = useState(student.notes ?? '')
  const [classes,        setClasses]        = useState(initialClasses)
  const [addClassId,     setAddClassId]     = useState('')

  const handleSave = async () => {
    if (!fullName.trim()) { toast.error('Họ tên không được để trống'); return }
    setSaving(true)
    const fd = new FormData()
    fd.set('full_name', fullName); fd.set('phone', phone); fd.set('email', email)
    fd.set('date_of_birth', dob); fd.set('parent_name', parentName); fd.set('parent_phone', parentPhone)
    fd.set('enrollment_date', enrollmentDate); fd.set('status', status); fd.set('notes', notes)
    try { await updateSchoolStudent(student.id, fd); toast.success('Đã lưu thông tin') }
    catch (e: any) { toast.error(e.message) }
    setSaving(false)
  }

  const handleDelete = () => {
    if (!confirm(`Xoá học viên "${student.full_name}"? Lịch sử điểm danh cũng sẽ bị xoá.`)) return
    startTransition(() => deleteSchoolStudent(student.id))
  }

  const presentCount = attendance.filter(a => a.status === 'present' || a.status === 'late').length
  const attendRate   = attendance.length ? Math.round((presentCount / attendance.length) * 100) : null

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-gray-100 bg-white flex items-center gap-3 flex-wrap">
        <Link href="/admin/school/students" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#1A2744] transition-colors">
          <ChevronLeft size={16} /> Học viên
        </Link>
        <span className="text-base font-bold text-[#1A2744] flex-1 truncate">{student.full_name}</span>
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

          {/* LEFT: Edit form */}
          <div className="lg:w-80 shrink-0 space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(26,39,68,0.08)] space-y-3">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Thông tin học viên</h2>
              {[
                { l: 'Họ và tên', v: fullName, s: setFullName },
                { l: 'Số điện thoại', v: phone, s: setPhone },
                { l: 'Email', v: email, s: setEmail },
              ].map(f => (
                <div key={f.l} className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">{f.l}</label>
                  <Input value={f.v} onChange={e => f.s(e.target.value)}
                    className="h-9 border-gray-200 rounded-xl text-sm focus-visible:border-[#E8303A] focus-visible:ring-0" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Ngày sinh</label>
                  <Input value={dob} onChange={e => setDob(e.target.value)} type="date"
                    className="h-9 border-gray-200 rounded-xl text-sm focus-visible:border-[#E8303A] focus-visible:ring-0" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Nhập học</label>
                  <Input value={enrollmentDate} onChange={e => setEnrollmentDate(e.target.value)} type="date"
                    className="h-9 border-gray-200 rounded-xl text-sm focus-visible:border-[#E8303A] focus-visible:ring-0" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Trạng thái</label>
                <select value={status} onChange={e => setStatus(e.target.value)}
                  className="w-full h-9 rounded-xl border border-gray-200 bg-white px-2.5 text-sm focus:outline-none focus:border-[#E8303A]">
                  {STATUS_OPTIONS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                </select>
              </div>
              {/* Multi-class enrollment */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500">Lớp học</label>
                {classes.length === 0 && <p className="text-xs text-gray-300 italic">Chưa xếp lớp nào</p>}
                {classes.map(c => (
                  <div key={c.class_id} className="flex items-center gap-2 bg-blue-50 rounded-xl px-3 py-2">
                    <span className="flex-1 text-xs font-medium text-[#1A2744] truncate">{c.class_name}</span>
                    <button onClick={() => {
                      if (!confirm(`Xoá khỏi lớp "${c.class_name}"?`)) return
                      startTransition(async () => {
                        try {
                          await removeStudentFromClass(student.id, c.class_id)
                          setClasses(prev => prev.filter(x => x.class_id !== c.class_id))
                          toast.info('Đã xoá khỏi lớp')
                        } catch { toast.error('Không thể xoá') }
                      })
                    }} className="text-gray-400 hover:text-red-500 transition-colors shrink-0">✕</button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <select value={addClassId} onChange={e => setAddClassId(e.target.value)}
                    className="flex-1 h-8 rounded-xl border border-gray-200 bg-white px-2.5 text-xs text-[#1A2744] focus:outline-none focus:border-[#E8303A]">
                    <option value="">+ Thêm vào lớp...</option>
                    {allClasses.filter(c => !classes.find(ec => ec.class_id === c.id)).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <button disabled={!addClassId} onClick={() => {
                    const cls = allClasses.find(c => c.id === addClassId)!
                    startTransition(async () => {
                      try {
                        await addStudentToClass(student.id, addClassId)
                        setClasses(prev => [...prev, { class_id: addClassId, class_name: cls.name, enrolled_at: null, status: 'active' }])
                        setAddClassId('')
                        toast.success(`Đã thêm vào ${cls.name}`)
                      } catch { toast.error('Không thể thêm') }
                    })
                  }} className="h-8 px-3 rounded-xl bg-[#1A2744] hover:bg-[#243461] text-white text-xs font-semibold transition-colors disabled:opacity-40">
                    Thêm
                  </button>
                </div>
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
                  <Input value={f.v} onChange={e => f.s(e.target.value)}
                    className="h-9 border-gray-200 rounded-xl text-sm focus-visible:border-[#E8303A] focus-visible:ring-0" />
                </div>
              ))}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Ghi chú</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm resize-none focus:outline-none focus:border-[#E8303A]" />
              </div>
            </div>
          {/* Account card */}
            <div className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(26,39,68,0.08)] space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Tài khoản học viên</h2>
                {student.auth_user_id
                  ? <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">✓ Đã có tài khoản</span>
                  : <span className="text-xs font-semibold bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">Chưa có tài khoản</span>}
              </div>

              {student.phone && (
                <div className="text-xs text-gray-500">
                  Đăng nhập bằng: <span className="font-mono font-semibold text-[#1A2744]">{student.phone.replace(/\s/g,'').replace(/^\+84/,'0')}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">
                  {student.auth_user_id ? 'Đặt lại mật khẩu mới' : 'Mật khẩu (để tạo tài khoản)'}
                </label>
                <div className="flex gap-2">
                  <Input value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    type="text" placeholder="Nhập mật khẩu mới..."
                    className="h-9 border-gray-200 rounded-xl text-sm focus-visible:border-[#E8303A] focus-visible:ring-0 flex-1" />
                  <Button
                    onClick={async () => {
                      if (!newPassword.trim()) { toast.error('Nhập mật khẩu'); return }
                      if (!student.phone) { toast.error('Học viên chưa có số điện thoại'); return }
                      setAccountSaving(true)
                      try {
                        if (student.auth_user_id) {
                          await resetStudentPassword(student.auth_user_id, newPassword)
                          toast.success('Đã đặt lại mật khẩu')
                        } else {
                          await createStudentAccount(student.id, student.phone, newPassword)
                          toast.success('Đã tạo tài khoản thành công')
                          window.location.reload()
                        }
                        setNewPassword('')
                      } catch (e: any) { toast.error(e.message) }
                      setAccountSaving(false)
                    }}
                    disabled={accountSaving}
                    className="h-9 px-3 rounded-xl bg-[#1A2744] hover:bg-[#243461] text-white border-0 text-xs shrink-0">
                    {accountSaving ? '...' : student.auth_user_id ? 'Đặt lại' : 'Tạo TK'}
                  </Button>
                </div>
              </div>

              {student.auth_user_id && (
                <button
                  onClick={async () => {
                    if (!confirm('Xoá tài khoản này? Học viên sẽ không thể đăng nhập.')) return
                    try {
                      await deleteStudentAccount(student.auth_user_id!, student.id)
                      toast.success('Đã xoá tài khoản')
                      window.location.reload()
                    } catch (e: any) { toast.error(e.message) }
                  }}
                  className="text-xs text-red-400 hover:text-red-600 transition-colors">
                  Xoá tài khoản
                </button>
              )}
            </div>
          </div>

          {/* RIGHT: Attendance */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-[#1A2744]">
                Điểm danh <span className="text-gray-400 font-normal">({attendance.length} buổi)</span>
              </h2>
              {attendRate !== null && (
                <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full',
                  attendRate >= 80 ? 'bg-emerald-100 text-emerald-700' :
                  attendRate >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600')}>
                  {presentCount}/{attendance.length} có mặt ({attendRate}%)
                </span>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(26,39,68,0.08)] overflow-hidden">
              {attendance.length === 0 ? (
                <div className="px-5 py-12 text-center text-gray-400 text-sm">Chưa có buổi điểm danh nào</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50/80 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Ngày</th>
                      <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden sm:table-cell">Lớp</th>
                      <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {attendance.map((a, i) => (
                      <tr key={i} className="hover:bg-gray-50/50">
                        <td className="px-5 py-3 text-sm text-[#1A2744] tabular-nums">
                          {new Date(a.session_date + 'T00:00:00').toLocaleDateString('vi-VN', {
                            weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric',
                          })}
                        </td>
                        <td className="px-3 py-3 text-xs text-gray-400 hidden sm:table-cell">{a.class_name ?? '—'}</td>
                        <td className="px-3 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ATT_STYLE[a.status] ?? 'bg-gray-100 text-gray-500'}`}>
                            {ATT_LABEL[a.status] ?? a.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
