'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, ClipboardList, BookOpen, FileText, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { logoutAction } from '@/lib/admin-actions'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/admin/dashboard', label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/admin/students',  label: 'Học viên',      icon: Users           },
  { href: '/admin/sessions',  label: 'Bài thi',        icon: ClipboardList   },
  { href: '/admin/questions', label: 'Câu hỏi',        icon: BookOpen        },
  { href: '/admin/passages',  label: 'Bài đọc / Nghe', icon: FileText        },
]

function NavLinks({ onNav }: { onNav?: () => void }) {
  const pathname = usePathname()
  return (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            onClick={onNav}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
              active
                ? 'bg-[#E8303A] text-white'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            )}
          >
            <Icon size={18} className="shrink-0" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

export function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 bg-[#1A2744] min-h-screen sticky top-0 h-screen">
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-white/10 shrink-0">
          <Image src="/happy_house_sun.png" alt="logo" width={32} height={32} className="object-contain" />
          <span className="text-white font-bold text-base">HappyHouse</span>
          <span className="text-white/40 text-xs font-medium ml-auto">Admin</span>
        </div>
        <NavLinks />
        <div className="px-3 pb-4 shrink-0">
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:bg-white/10 hover:text-white transition-colors"
            >
              <LogOut size={18} />
              Đăng xuất
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-[#1A2744] flex items-center justify-between px-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Image src="/happy_house_sun.png" alt="logo" width={28} height={28} className="object-contain" />
          <span className="text-white font-bold text-sm">HappyHouse Admin</span>
        </div>
        <button
          onClick={() => setMobileOpen(v => !v)}
          className="text-white/70 hover:text-white p-1"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setMobileOpen(false)}>
          <div
            className="absolute top-14 left-0 right-0 bg-[#1A2744] border-b border-white/10 pb-4"
            onClick={e => e.stopPropagation()}
          >
            <NavLinks onNav={() => setMobileOpen(false)} />
            <div className="px-3">
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <LogOut size={18} />
                  Đăng xuất
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
