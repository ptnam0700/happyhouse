import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/service'
import { ChevronRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Học viên' }

const BAND_COLOR: Record<string, string> = {
  '6.5 – 7.0': 'bg-emerald-100 text-emerald-700',
  '5.5 – 6.0': 'bg-blue-100 text-blue-700',
  '4.5 – 5.0': 'bg-yellow-100 text-yellow-700',
  '3.5 – 4.0': 'bg-orange-100 text-orange-700',
  'Below 3.5': 'bg-red-100 text-red-700',
}

export default async function StudentsPage() {
  const db = createServiceClient()
  const { data: students } = await db
    .from('students')
    .select('id, full_name, phone, email, test_count, latest_band, last_test_at, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="p-4 sm:p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-[#1A2744]">Học viên</h1>
        <span className="text-sm text-gray-400">{students?.length ?? 0} học viên</span>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(26,39,68,0.08)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Học viên</th>
                <th className="text-left px-3 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden sm:table-cell">Email</th>
                <th className="text-left px-3 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Số bài</th>
                <th className="text-left px-3 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Band gần nhất</th>
                <th className="text-left px-3 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden md:table-cell">Lần cuối</th>
                <th className="px-3 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {students?.map(s => (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-[#1A2744]">{s.full_name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{s.phone}</div>
                  </td>
                  <td className="px-3 py-3.5 text-gray-500 hidden sm:table-cell">
                    {s.email ?? <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-3 py-3.5">
                    <span className="font-semibold text-[#1A2744]">{s.test_count ?? 0}</span>
                  </td>
                  <td className="px-3 py-3.5">
                    {s.latest_band ? (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${BAND_COLOR[s.latest_band] ?? 'bg-gray-100 text-gray-500'}`}>
                        {s.latest_band}
                      </span>
                    ) : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  <td className="px-3 py-3.5 text-gray-400 text-xs hidden md:table-cell">
                    {s.last_test_at ? new Date(s.last_test_at).toLocaleDateString('vi-VN') : '—'}
                  </td>
                  <td className="px-3 py-3.5">
                    <Link
                      href={`/admin/students/${s.id}`}
                      className="text-gray-300 hover:text-[#E8303A] transition-colors"
                    >
                      <ChevronRight size={18} />
                    </Link>
                  </td>
                </tr>
              ))}
              {!students?.length && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400">Chưa có học viên nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
