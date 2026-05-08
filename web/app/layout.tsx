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
    default: 'HappyHouse IELTS',
    template: '%s | HappyHouse IELTS',
  },
  description: 'Trung tâm luyện thi IELTS chuyên nghiệp với bài kiểm tra trình độ miễn phí và lộ trình học phù hợp.',
  applicationName: 'HappyHouse IELTS',
  authors: [{ name: 'HappyHouse IELTS', url: SITE_URL }],
  creator: 'HappyHouse IELTS',
  publisher: 'HappyHouse IELTS',
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
