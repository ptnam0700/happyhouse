import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s | HappyHouse Admin' },
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F6F2]">
      <AdminSidebar />
      {/* pt-14 reserves space for the mobile fixed top bar */}
      <main className="flex-1 min-w-0 min-h-0 overflow-hidden pt-14 md:pt-0 flex flex-col">
        {children}
      </main>
      <Toaster
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast:   'font-sans text-sm rounded-xl shadow-lg border-0',
            success: 'bg-[#1A2744] text-white',
            error:   'bg-[#E8303A] text-white',
            info:    'bg-white text-[#1A2744] shadow-[0_4px_24px_rgba(26,39,68,0.15)]',
          },
        }}
      />
    </div>
  )
}
