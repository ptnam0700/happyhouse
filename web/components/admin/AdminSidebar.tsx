'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, ClipboardList, BookOpen, FileText,
  GraduationCap, HelpCircle, LogOut, Menu, X,
  School, ClipboardCheck, UserCheck,
} from 'lucide-react'
import { useState } from 'react'
import { logoutAction } from '@/lib/admin-actions'
import { cn } from '@/lib/utils'

const CRM_NAV = [
  { href: '/admin/dashboard', label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/admin/students',  label: 'Ứng viên',      icon: Users           },
  { href: '/admin/sessions',  label: 'Kết quả test',  icon: ClipboardList   },
  { href: '/admin/tests',     label: 'Bài kiểm tra',  icon: GraduationCap   },
  { href: '/admin/questions', label: 'Câu hỏi',       icon: BookOpen        },
  { href: '/admin/passages',  label: 'Bài đọc/Nghe',  icon: FileText        },
]

const SCHOOL_NAV = [
  { href: '/admin/school/classes',    label: 'Lớp học',    icon: School          },
  { href: '/admin/school/students',   label: 'Học viên',   icon: UserCheck       },
  { href: '/admin/school/attendance', label: 'Điểm danh',  icon: ClipboardCheck  },
]

const BOTTOM_NAV = [
  { href: '/admin/guide', label: 'Hướng dẫn', icon: HelpCircle },
]

function NavSection({ title, items, onNav }: { title?: string; items: typeof CRM_NAV; onNav?: () => void }) {
  const pathname = usePathname()
  return (
    <div>
      {title && <div className="px-4 pt-4 pb-1 text-[0.6rem] font-bold text-white/30 uppercase tracking-widest">{title}</div>}
      <div className="px-2 space-y-0.5">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link key={href} href={href} onClick={onNav}
              className={cn('flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors',
                active ? 'bg-[#E8303A] text-white' : 'text-white/65 hover:bg-white/10 hover:text-white')}>
              <Icon size={16} className="shrink-0" />
              {label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const SidebarContent = ({ onNav }: { onNav?: () => void }) => (
    <>
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-white/10 shrink-0">
        <Image src="/happy_house_sun.png" alt="logo" width={30} height={30} className="object-contain" />
        <span className="text-white font-bold text-sm">HappyHouse</span>
        <span className="text-white/30 text-[0.6rem] font-bold uppercase tracking-wider ml-auto">Admin</span>
      </div>

      <div className="flex-1 overflow-y-auto py-2 space-y-1">
        <NavSection title="CRM & Tuyển sinh" items={CRM_NAV} onNav={onNav} />
        <div className="mx-4 my-3 border-t border-white/10" />
        <NavSection title="Quản lý học" items={SCHOOL_NAV} onNav={onNav} />
      </div>

      <div className="px-2 py-2 border-t border-white/10 shrink-0 space-y-0.5">
        <NavSection items={BOTTOM_NAV} onNav={onNav} />
        <form action={logoutAction}>
          <button type="submit"
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium text-white/40 hover:bg-white/10 hover:text-white transition-colors">
            <LogOut size={16} /> Đăng xuất
          </button>
        </form>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 bg-[#1A2744] h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-[#1A2744] flex items-center justify-between px-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Image src="/happy_house_sun.png" alt="logo" width={26} height={26} className="object-contain" />
          <span className="text-white font-bold text-sm">HappyHouse Admin</span>
        </div>
        <button onClick={() => setMobileOpen(v => !v)} className="text-white/70 hover:text-white p-1">
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setMobileOpen(false)}>
          <div className="absolute top-14 left-0 right-0 bg-[#1A2744] border-b border-white/10 max-h-[calc(100vh-56px)] overflow-y-auto flex flex-col"
            onClick={e => e.stopPropagation()}>
            <SidebarContent onNav={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}
