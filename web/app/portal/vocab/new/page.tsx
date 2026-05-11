import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NewCollectionClient } from './NewCollectionClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Tạo bộ từ vựng' }

export default async function NewCollectionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/portal/login')
  return <NewCollectionClient />
}
