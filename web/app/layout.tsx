import type { Metadata, Viewport } from 'next'
import { Be_Vietnam_Pro } from 'next/font/google'
import { TestProvider } from '@/lib/test-context'
import './globals.css'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://happyhouseielts.com'

const beVietnamPro = Be_Vietnam_Pro({
  variable: '--font-sans',
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700'],
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1A2744',
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'HappyHouse English Center',
    template: '%s | HappyHouse English Center',
  },
  description: 'Trung tâm tiếng Anh đồng hành cùng trẻ em và học sinh. Lộ trình phù hợp theo độ tuổi, lớp học tương tác, tư vấn tận tâm.',
  applicationName: 'HappyHouse English Center',
  authors: [{ name: 'HappyHouse English Center', url: SITE_URL }],
  creator: 'HappyHouse English Center',
  publisher: 'HappyHouse English Center',
  icons: {
    icon: '/happy_house_sun.png',
    apple: '/happy_house_sun.png',
  },
  manifest: '/manifest.json',
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
