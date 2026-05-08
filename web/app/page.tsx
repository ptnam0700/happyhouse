import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { LandingClient } from '@/components/landing/LandingClient'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://happyhouseielts.com'

export const metadata: Metadata = {
  title: 'Kiểm Tra Trình Độ IELTS Miễn Phí | HappyHouse IELTS',
  description:
    'Bài kiểm tra trình độ IELTS chuẩn hoá, hoàn toàn miễn phí. Được thiết kế bởi đội ngũ giáo viên 8.5+ IELTS tại HappyHouse. Nhận kết quả band score và lộ trình học ngay.',
  keywords: [
    'kiểm tra trình độ IELTS',
    'placement test IELTS',
    'bài thi IELTS miễn phí',
    'HappyHouse IELTS',
    'luyện thi IELTS',
    'trung tâm tiếng Anh',
    'band score IELTS',
    'học IELTS',
  ],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'HappyHouse IELTS',
    locale: 'vi_VN',
    title: 'Kiểm Tra Trình Độ IELTS Miễn Phí | HappyHouse IELTS',
    description:
      'Bài kiểm tra trình độ IELTS chuẩn hoá do đội ngũ 8.5+ thiết kế. Nhận band score và lộ trình học IELTS phù hợp hoàn toàn miễn phí.',
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'HappyHouse IELTS – Kiểm tra trình độ miễn phí',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kiểm Tra Trình Độ IELTS Miễn Phí | HappyHouse IELTS',
    description:
      'Bài kiểm tra IELTS chuẩn hoá miễn phí. Nhận band score và lộ trình học phù hợp ngay hôm nay.',
    images: [`${SITE_URL}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' },
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'EducationalOrganization',
      '@id': `${SITE_URL}/#organization`,
      name: 'HappyHouse IELTS',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/happy_house_sun.png`,
      },
      description:
        'Trung tâm luyện thi IELTS chuyên nghiệp với đội ngũ giáo viên đạt 8.5+ IELTS.',
      sameAs: [],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'HappyHouse IELTS',
      publisher: { '@id': `${SITE_URL}/#organization` },
      inLanguage: 'vi-VN',
    },
    {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/#webpage`,
      url: SITE_URL,
      name: 'Kiểm Tra Trình Độ IELTS Miễn Phí',
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': `${SITE_URL}/#organization` },
      description: 'Bài kiểm tra trình độ IELTS chuẩn hoá miễn phí tại HappyHouse.',
      inLanguage: 'vi-VN',
    },
    {
      '@type': 'Service',
      '@id': `${SITE_URL}/#service`,
      name: 'Bài Kiểm Tra Trình Độ IELTS',
      provider: { '@id': `${SITE_URL}/#organization` },
      description:
        'Kiểm tra trình độ IELTS miễn phí gồm Ngữ pháp, Từ vựng, Đọc hiểu và Nghe hiểu. Nhận band score IELTS ước tính và tư vấn lộ trình học.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'VND',
        availability: 'https://schema.org/InStock',
      },
    },
  ],
}

export default function LandingPage() {
  return (
    <div className="w-full min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header />

      {/* Hero — static, server-rendered for SEO */}
      <section
        aria-label="Giới thiệu"
        className="w-full bg-gradient-to-br from-[#1A2744] to-[#243461] px-4 py-12 sm:py-20 text-center text-white"
      >
        <h1 className="text-[clamp(1.75rem,5vw,3.5rem)] font-bold leading-tight mb-3">
          Kiểm tra trình độ
          <br />
          <span className="text-[#F5A623]">IELTS</span> của bạn
        </h1>
        <p className="text-sm sm:text-base text-white/75 max-w-[480px] mx-auto">
          Bài kiểm tra chuẩn hoá được thiết kế bởi đội ngũ 8.5+ IELTS của HappyHouse.
          Hoàn toàn miễn phí.
        </p>
      </section>

      {/* Interactive client section */}
      <LandingClient />
    </div>
  )
}
