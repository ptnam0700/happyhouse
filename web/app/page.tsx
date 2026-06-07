import type { Metadata } from 'next'
import { LandingPage } from '@/components/landing/LandingPage'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://happyhouse-one.vercel.app'

export const metadata: Metadata = {
  title: 'HappyHouse English Center | Trung tâm tiếng Anh cho trẻ em và học sinh',
  description:
    'HappyHouse đồng hành cùng trẻ em, học sinh tiểu học và THCS xây nền tảng tiếng Anh vững chắc qua lộ trình phù hợp, lớp học tương tác và tư vấn tận tâm.',
  keywords: [
    'trung tâm tiếng Anh trẻ em',
    'tiếng Anh tiểu học',
    'tiếng Anh THCS',
    'Cambridge cho trẻ em',
    'học tiếng Anh cho bé',
    'HappyHouse English Center',
    'lộ trình tiếng Anh',
    'ôn thi vào 10',
  ],
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'HappyHouse English Center',
    locale: 'vi_VN',
    title: 'HappyHouse English Center | Trung tâm tiếng Anh cho trẻ em và học sinh',
    description: 'Đồng hành cùng trẻ em và học sinh từ những bước tiếng Anh đầu tiên đến các cột mốc lớn — Cambridge, ôn thi vào 10, IELTS.',
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: 'HappyHouse English Center' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HappyHouse English Center | Tiếng Anh cho trẻ em & học sinh',
    description: 'Lộ trình tiếng Anh phù hợp theo độ tuổi — từ trẻ em đến THCS. Đăng ký học thử miễn phí.',
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
      description: 'Trung tâm tiếng Anh đồng hành cùng trẻ em và học sinh từ giai đoạn làm quen đến Cambridge, ôn thi vào 10 và IELTS.',
      telephone: '+84845956888',
      address: [
        { '@type': 'PostalAddress', streetAddress: 'Số 2 Hàm Từ Quan', addressLocality: 'Hà Nội', addressCountry: 'VN' },
        { '@type': 'PostalAddress', streetAddress: 'Số 4 Ngõ 35 Phúc Lợi', addressLocality: 'Hà Nội', addressCountry: 'VN' },
      ],
    },
    {
      '@type': 'Service',
      name: 'Bài Kiểm Tra Trình Độ Tiếng Anh',
      provider: { '@id': `${SITE_URL}/#organization` },
      description: 'Kiểm tra trình độ tiếng Anh miễn phí gồm Ngữ pháp, Từ vựng, Đọc hiểu và Nghe hiểu.',
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
