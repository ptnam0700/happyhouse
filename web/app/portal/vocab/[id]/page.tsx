import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { WordListClient } from './WordListClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Bộ từ vựng' }

export default async function CollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/portal/login')

  const db = createServiceClient()
  const { data: student } = await db.from('school_students').select('id').eq('auth_user_id', user.id).single()
  if (!student) redirect('/portal/login')

  const [{ data: collection }, { data: words }] = await Promise.all([
    db.from('vocab_collections').select('*').eq('id', id).eq('student_id', student.id).single(),
    db.from('vocab_words').select('*').eq('collection_id', id).order('created_at', { ascending: false }),
  ])

  if (!collection) notFound()

  // Progress for this student
  const wordIds = (words ?? []).map((w: any) => w.id)
  const { data: progress } = wordIds.length
    ? await db.from('vocab_progress').select('word_id, status').eq('student_id', student.id).in('word_id', wordIds)
    : { data: [] }

  const progressMap: Record<string, string> = {}
  ;(progress ?? []).forEach((p: any) => { progressMap[p.word_id] = p.status })

  return (
    <WordListClient
      collection={collection}
      words={words ?? []}
      progressMap={progressMap}
      studentId={student.id}
    />
  )
}
