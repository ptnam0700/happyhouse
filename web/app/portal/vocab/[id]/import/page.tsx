import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { ImportClient } from './ImportClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Import từ vựng' }

export default async function ImportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/portal/login')

  const db = createServiceClient()
  const { data: student } = await db.from('school_students').select('id').eq('auth_user_id', user.id).single()
  if (!student) redirect('/portal/login')

  const { data: collection } = await db.from('vocab_collections').select('id, name, color').eq('id', id).eq('student_id', student.id).single()
  if (!collection) notFound()

  return <ImportClient collection={collection} />
}
