import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { default: 'HappyHouse Portal', template: '%s | HappyHouse' },
  robots: { index: false, follow: false },
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
