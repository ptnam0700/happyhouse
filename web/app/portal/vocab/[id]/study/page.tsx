import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { StudyClient } from './StudyClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Học từ vựng' }

export default async function StudyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/portal/login')

  const db = createServiceClient()
  const { data: student } = await db.from('school_students').select('id').eq('auth_user_id', user.id).single()
  if (!student) redirect('/portal/login')

  const [{ data: collection }, { data: words }] = await Promise.all([
    db.from('vocab_collections').select('*').eq('id', id).eq('student_id', student.id).single(),
    db.from('vocab_words').select('*').eq('collection_id', id),
  ])

  if (!collection || !words?.length) notFound()

  const { data: progress } = await db.from('vocab_progress').select('*').eq('student_id', student.id).in('word_id', words.map(w => w.id))
  const progressMap: Record<string, any> = {}
  ;(progress ?? []).forEach(p => { progressMap[p.word_id] = p })

  return <StudyClient collection={collection} words={words} progressMap={progressMap} studentId={student.id} />
}
