import type { Metadata } from 'next'
import { Be_Vietnam_Pro } from 'next/font/google'
import { TestProvider } from '@/lib/test-context'
import './globals.css'

const beVietnamPro = Be_Vietnam_Pro({
  variable: '--font-sans',
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'HappyHouse IELTS',
  description: 'Kiểm tra trình độ IELTS chuẩn hoá bởi đội ngũ 8.5+ HappyHouse',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${beVietnamPro.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#F7F6F2]">
        <TestProvider>{children}</TestProvider>
      </body>
    </html>
  )
}
