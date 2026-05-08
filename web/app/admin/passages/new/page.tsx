import { Suspense } from 'react'
import { NewPassageClient } from '@/components/admin/NewPassageClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Tạo bài mới' }

async function NewPassagePage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams
  const passageType = type === 'listening' ? 'listening' : 'reading'
  return <NewPassageClient type={passageType} />
}

export default function Page(props: { searchParams: Promise<{ type?: string }> }) {
  return (
    <Suspense>
      <NewPassagePage {...props} />
    </Suspense>
  )
}
