import type { Metadata } from 'next'
import { LandingPage } from '@/components/landing/LandingPage'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://happyhouseielts.com'

export const metadata: Metadata = {
  title: 'HappyHouse English Center | Trung tâm IELTS chuyên sâu',
  description:
    'HappyHouse English Center – đào tạo IELTS chuyên sâu với đội ngũ giáo viên 8.5+. Kiểm tra trình độ miễn phí, lộ trình cá nhân hoá, cam kết đầu ra.',
  keywords: [
    'HappyHouse IELTS', 'trung tâm IELTS', 'học IELTS', 'luyện thi IELTS',
    'kiểm tra trình độ IELTS', 'khóa học IELTS', 'IELTS tiếng Anh',
  ],
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: 'website', url: SITE_URL, siteName: 'HappyHouse English Center',
    locale: 'vi_VN',
    title: 'HappyHouse English Center | Trung tâm IELTS chuyên sâu',
    description: 'Đào tạo IELTS chuyên sâu — đội ngũ 8.5+, lớp nhỏ, lộ trình cá nhân. Kiểm tra trình độ miễn phí ngay.',
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: 'HappyHouse IELTS' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HappyHouse English Center | IELTS chuyên sâu',
    description: 'Kiểm tra trình độ IELTS miễn phí. Lộ trình cá nhân hoá, giáo viên 8.5+.',
    images: [`${SITE_URL}/og-image.png`],
  },
  robots: { index: true, follow: true },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'EducationalOrganization',
      '@id': `${SITE_URL}/#organization`,
      name: 'HappyHouse English Center',
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/happy_house_sun.png` },
      description: 'Trung tâm IELTS chuyên sâu với đội ngũ giáo viên đạt 8.5+ IELTS.',
    },
    {
      '@type': 'Service',
      name: 'Bài Kiểm Tra Trình Độ IELTS',
      provider: { '@id': `${SITE_URL}/#organization` },
      description: 'Kiểm tra trình độ IELTS miễn phí gồm Ngữ pháp, Từ vựng, Đọc hiểu và Nghe hiểu.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'VND' },
    },
  ],
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPage />
    </>
  )
}
