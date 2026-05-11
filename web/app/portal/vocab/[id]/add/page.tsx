import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { WordEditorClient } from './WordEditorClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Thêm từ mới' }

export default async function AddWordPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ edit?: string }> }) {
  const { id } = await params
  const { edit } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/portal/login')

  const db = createServiceClient()
  const { data: student } = await db.from('school_students').select('id').eq('auth_user_id', user.id).single()
  if (!student) redirect('/portal/login')

  const { data: collection } = await db.from('vocab_collections').select('id, name, color').eq('id', id).eq('student_id', student.id).single()
  if (!collection) notFound()

  let wordData = null
  if (edit) {
    const { data: w } = await db.from('vocab_words').select('*').eq('id', edit).eq('collection_id', id).single()
    wordData = w
  }

  return <WordEditorClient collection={collection} initialWord={wordData} />
}
