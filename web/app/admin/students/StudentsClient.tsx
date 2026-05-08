'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Search, X, Pencil, Trash2, ChevronRight, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { updateStudent, deleteStudent } from './actions'
import { cn } from '@/lib/utils'

interface Student {
  id: string; full_name: string; phone: string; email: string | null
  test_count: number | null; latest_band: string | null; last_test_at: string | null
  created_at: string | null
}

const BAND_COLOR: Record<string, string> = {
  '6.5 – 7.0': 'bg-emerald-100 text-emerald-700',
  '5.5 – 6.0': 'bg-blue-100 text-blue-700',
  '4.5 – 5.0': 'bg-yellow-100 text-yellow-700',
  '3.5 – 4.0': 'bg-orange-100 text-orange-700',
  'Below 3.5': 'bg-red-100 text-red-700',
}

const BANDS = ['6.5 – 7.0','5.5 – 6.0','4.5 – 5.0','3.5 – 4.0','Below 3.5']

function EditRow({ student, onSave, onCancel }: {
  student: Student
  onSave: (id: string, data: { full_name: string; phone: string; email: string }) => Promise<void>
  onCancel: () => void
}) {
  const [name,  setName]  = useState(student.full_name)
  const [phone, setPhone] = useState(student.phone)
  const [email, setEmail] = useState(student.email ?? '')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!name.trim() || !phone.trim()) { toast.error('Họ tên và số điện thoại không được để trống'); return }
    setSaving(true)
    await onSave(student.id, { full_name: name, phone, email })
    setSaving(false)
  }

  return (
    <tr className="bg-blue-50/50 border-b border-blue-100">
      <td colSpan={6} className="px-5 py-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="space-y-1 min-w-[160px]">
            <label className="text-xs font-semibold text-gray-500">Họ và tên</label>
            <Input value={name} onChange={e => setName(e.target.value)}
              className="h-9 text-sm border-gray-200 rounded-xl focus-visible:border-[#E8303A] focus-visible:ring-0 w-48" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500">Số điện thoại</label>
            <Input value={phone} onChange={e => setPhone(e.target.value)}
              className="h-9 text-sm border-gray-200 rounded-xl focus-visible:border-[#E8303A] focus-visible:ring-0 w-36" />
          </div>
          <div className="space-y-1 flex-1 min-w-[180px]">
            <label className="text-xs font-semibold text-gray-500">Email</label>
            <Input value={email} onChange={e => setEmail(e.target.value)}
              className="h-9 text-sm border-gray-200 rounded-xl focus-visible:border-[#E8303A] focus-visible:ring-0" />
          </div>
          <div className="flex gap-2">
            <Button onClick={save} disabled={saving}
              className="h-9 px-4 rounded-xl bg-[#E8303A] hover:bg-[#C0222B] text-white border-0 text-sm">
              <Check size={14} className="mr-1" />{saving ? 'Lưu...' : 'Lưu'}
            </Button>
            <Button variant="outline" onClick={onCancel}
              className="h-9 px-4 rounded-xl border-gray-200 text-sm">
              Huỷ
            </Button>
          </div>
        </div>
      </td>
    </tr>
  )
}

export function StudentsClient({ students: initial }: { students: Student[] }) {
  const [students, setStudents] = useState(initial)
  const [search,   setSearch]   = useState('')
  const [band,     setBand]     = useState('all')
  const [editingId, setEditing] = useState<string | null>(null)
  const [, startTransition]     = useTransition()

  const filtered = students.filter(s => {
    const term = search.trim().toLowerCase()
    const matchSearch = !term ||
      s.full_name.toLowerCase().includes(term) ||
      s.phone.includes(term) ||
      (s.email ?? '').toLowerCase().includes(term)
    const matchBand = band === 'all' || s.latest_band === band
    return matchSearch && matchBand
  })

  const handleSave = async (id: string, data: { full_name: string; phone: string; email: string }) => {
    try {
      await updateStudent(id, data)
      setStudents(prev => prev.map(s => s.id === id ? { ...s, ...data, email: data.email || null } : s))
      setEditing(null)
      toast.success('Đã cập nhật thông tin học viên')
    } catch (e: any) { toast.error(e.message) }
  }

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Xoá học viên "${name}"? Toàn bộ bài thi của học viên cũng sẽ bị xoá.`)) return
    startTransition(async () => {
      try {
        await deleteStudent(id)
        setStudents(prev => prev.filter(s => s.id !== id))
        toast.success('Đã xoá học viên')
      } catch { toast.error('Không thể xoá học viên') }
    })
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setBand('all')}
            className={cn('text-xs font-semibold px-3 py-1.5 rounded-full transition-colors',
              band === 'all' ? 'bg-[#1A2744] text-white' : 'bg-white text-gray-500 hover:bg-gray-100 shadow-sm')}>
            Tất cả
          </button>
          {BANDS.map(b => (
            <button key={b} onClick={() => setBand(b === band ? 'all' : b)}
              className={cn('text-xs font-semibold px-3 py-1.5 rounded-full transition-colors',
                band === b ? 'bg-[#1A2744] text-white' : `bg-white text-gray-500 hover:bg-gray-100 shadow-sm`)}>
              {b}
            </button>
          ))}
        </div>
        <div className="relative sm:ml-auto w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tên, SĐT, email..."
            className="w-full h-9 pl-8 pr-8 rounded-xl border border-gray-200 bg-white text-sm placeholder:text-gray-300 focus:outline-none focus:border-[#E8303A]" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-2.5">{filtered.length} / {students.length} học viên</p>

      <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(26,39,68,0.08)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Học viên</th>
                <th className="text-left px-3 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden sm:table-cell">Email</th>
                <th className="text-left px-3 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Bài thi</th>
                <th className="text-left px-3 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Band</th>
                <th className="text-left px-3 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden md:table-cell">Lần cuối</th>
                <th className="px-3 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <>
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-[#1A2744]">{s.full_name}</div>
                      <div className="text-xs text-gray-400">{s.phone}</div>
                    </td>
                    <td className="px-3 py-3.5 text-gray-500 text-xs hidden sm:table-cell">{s.email ?? <span className="text-gray-300">—</span>}</td>
                    <td className="px-3 py-3.5 font-semibold text-[#1A2744]">{s.test_count ?? 0}</td>
                    <td className="px-3 py-3.5">
                      {s.latest_band
                        ? <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${BAND_COLOR[s.latest_band] ?? 'bg-gray-100 text-gray-500'}`}>{s.latest_band}</span>
                        : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className="px-3 py-3.5 text-xs text-gray-400 hidden md:table-cell">
                      {s.last_test_at ? new Date(s.last_test_at).toLocaleDateString('vi-VN') : '—'}
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setEditing(editingId === s.id ? null : s.id)}
                          className="p-1.5 rounded-lg text-gray-300 hover:text-[#1A2744] hover:bg-gray-100 transition-colors">
                          <Pencil size={13} />
                        </button>
                        <Link href={`/admin/students/${s.id}`}
                          className="p-1.5 rounded-lg text-gray-300 hover:text-[#1A2744] hover:bg-gray-100 transition-colors">
                          <ChevronRight size={13} />
                        </Link>
                        <button onClick={() => handleDelete(s.id, s.full_name)}
                          className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {editingId === s.id && (
                    <EditRow key={`edit-${s.id}`} student={s} onSave={handleSave} onCancel={() => setEditing(null)} />
                  )}
                </>
              ))}
              {!filtered.length && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400">
                  {search || band !== 'all' ? 'Không tìm thấy học viên' : 'Chưa có học viên nào'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
