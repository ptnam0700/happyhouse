'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Search, X, Pencil, Trash2, ChevronRight, Check, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/admin/Pagination'
import { updateStudent, deleteStudent } from './actions'
import { cn } from '@/lib/utils'

interface Student {
  id: string; full_name: string; phone: string; email: string | null
  test_count: number | null; latest_band: string | null; last_test_at: string | null
}

const PAGE_SIZE = 20

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
  onSave: (id: string, d: { full_name: string; phone: string; email: string }) => Promise<void>
  onCancel: () => void
}) {
  const [name, setName] = useState(student.full_name)
  const [phone, setPhone] = useState(student.phone)
  const [email, setEmail] = useState(student.email ?? '')
  const [saving, setSaving] = useState(false)
  const save = async () => {
    if (!name.trim() || !phone.trim()) { toast.error('Họ tên và SĐT không được để trống'); return }
    setSaving(true)
    await onSave(student.id, { full_name: name, phone, email })
    setSaving(false)
  }
  return (
    <tr className="bg-blue-50/50 border-b border-blue-100">
      <td colSpan={6} className="px-5 py-3">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="space-y-1 min-w-[150px]">
            <label className="text-xs font-semibold text-gray-500">Họ và tên</label>
            <Input value={name} onChange={e => setName(e.target.value)} className="h-8 text-sm border-gray-200 rounded-lg focus-visible:border-[#E8303A] focus-visible:ring-0 w-44" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500">Số điện thoại</label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} className="h-8 text-sm border-gray-200 rounded-lg focus-visible:border-[#E8303A] focus-visible:ring-0 w-36" />
          </div>
          <div className="space-y-1 flex-1 min-w-[160px]">
            <label className="text-xs font-semibold text-gray-500">Email</label>
            <Input value={email} onChange={e => setEmail(e.target.value)} className="h-8 text-sm border-gray-200 rounded-lg focus-visible:border-[#E8303A] focus-visible:ring-0" />
          </div>
          <div className="flex gap-2">
            <Button onClick={save} disabled={saving} className="h-8 px-3 rounded-lg bg-[#E8303A] hover:bg-[#C0222B] text-white border-0 text-xs">
              <Check size={13} className="mr-1" />{saving ? 'Lưu...' : 'Lưu'}
            </Button>
            <Button variant="outline" onClick={onCancel} className="h-8 px-3 rounded-lg border-gray-200 text-xs">Huỷ</Button>
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
  const [page,     setPage]     = useState(1)
  const [, startTransition]     = useTransition()

  const filtered = students.filter(s => {
    const term = search.trim().toLowerCase()
    const matchSearch = !term || s.full_name.toLowerCase().includes(term) || s.phone.includes(term) || (s.email ?? '').toLowerCase().includes(term)
    return matchSearch && (band === 'all' || s.latest_band === band)
  })
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleSave = async (id: string, data: { full_name: string; phone: string; email: string }) => {
    try {
      await updateStudent(id, data)
      setStudents(prev => prev.map(s => s.id === id ? { ...s, ...data, email: data.email || null } : s))
      setEditing(null)
      toast.success('Đã cập nhật học viên')
    } catch (e: any) { toast.error(e.message) }
  }
  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Xoá học viên "${name}"? Toàn bộ bài thi cũng sẽ bị xoá.`)) return
    startTransition(async () => {
      try { await deleteStudent(id); setStudents(prev => prev.filter(s => s.id !== id)); toast.success('Đã xoá') }
      catch { toast.error('Không thể xoá') }
    })
  }

  const onFilter = (fn: () => void) => { fn(); setPage(1) }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-gray-100 bg-white flex flex-wrap gap-2 items-center">
        <h1 className="text-base font-bold text-[#1A2744] mr-2">Học viên</h1>
        {['all', ...BANDS].map(b => (
          <button key={b} onClick={() => onFilter(() => setBand(b))}
            className={cn('text-xs font-semibold px-2.5 py-1 rounded-full transition-colors',
              band === b ? 'bg-[#1A2744] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}>
            {b === 'all' ? 'Tất cả' : b}
          </button>
        ))}
        <div className="relative ml-auto w-52">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => onFilter(() => setSearch(e.target.value))} placeholder="Tên, SĐT, email..."
            className="w-full h-8 pl-7 pr-7 rounded-xl border border-gray-200 bg-gray-50 text-xs placeholder:text-gray-300 focus:outline-none focus:border-[#E8303A]" />
          {search && <button onClick={() => onFilter(() => setSearch(''))} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"><X size={12} /></button>}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-white shadow-[0_1px_0_0_#e5e7eb]">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Học viên</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden sm:table-cell">Email</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Bài thi</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Band</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden md:table-cell">Lần cuối</th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-50">
            {paginated.map(s => (
              <>
                <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3"><div className="font-semibold text-[#1A2744]">{s.full_name}</div><div className="text-xs text-gray-400">{s.phone}</div></td>
                  <td className="px-3 py-3 text-xs text-gray-500 hidden sm:table-cell">{s.email ?? <span className="text-gray-300">—</span>}</td>
                  <td className="px-3 py-3 font-semibold text-[#1A2744]">{s.test_count ?? 0}</td>
                  <td className="px-3 py-3">
                    {s.latest_band ? <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${BAND_COLOR[s.latest_band] ?? 'bg-gray-100 text-gray-500'}`}>{s.latest_band}</span>
                      : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-400 hidden md:table-cell">
                    {s.last_test_at ? new Date(s.last_test_at).toLocaleDateString('vi-VN') : '—'}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => setEditing(editingId === s.id ? null : s.id)} className="p-1.5 rounded-lg text-gray-300 hover:text-[#1A2744] hover:bg-gray-100 transition-colors"><Pencil size={13} /></button>
                      <Link href={`/admin/students/${s.id}`} className="p-1.5 rounded-lg text-gray-300 hover:text-[#1A2744] hover:bg-gray-100 transition-colors"><ChevronRight size={13} /></Link>
                      <button onClick={() => handleDelete(s.id, s.full_name)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
                {editingId === s.id && <EditRow key={`edit-${s.id}`} student={s} onSave={handleSave} onCancel={() => setEditing(null)} />}
              </>
            ))}
            {!paginated.length && (
              <tr><td colSpan={6} className="px-5 py-16 text-center text-gray-400 text-sm">
                {search || band !== 'all' ? 'Không tìm thấy học viên' : 'Chưa có học viên nào'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="shrink-0 px-5 py-2.5 border-t border-gray-100 bg-white">
        <Pagination total={filtered.length} page={page} pageSize={PAGE_SIZE} onChange={setPage} />
      </div>
    </div>
  )
}
