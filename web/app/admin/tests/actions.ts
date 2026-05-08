'use server'

import { createServiceClient } from '@/lib/supabase/service'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

function str(fd: FormData, key: string) {
  return ((fd.get(key) ?? '') as string).trim()
}

export async function createTest(_: unknown, formData: FormData) {
  const db = createServiceClient()
  const { data, error } = await db.from('tests').insert({
    name:           str(formData, 'name') || 'Bài test mới',
    description:    str(formData, 'description') || null,
    time_limit_sec: parseInt(str(formData, 'time_limit_sec') || '5400', 10),
    published:      false,
  }).select('id').single()

  if (error) throw error
  redirect(`/admin/tests/${data.id}`)
}

export async function createTestWithQuestions(
  data: { name: string; description: string; time_limit_sec: number; published: boolean },
  questionIds: string[],
): Promise<{ id: string }> {
  const db = createServiceClient()

  const { data: test, error } = await db.from('tests').insert({
    name:           data.name.trim() || 'Bài test mới',
    description:    data.description.trim() || null,
    time_limit_sec: data.time_limit_sec,
    published:      data.published,
    active:         true,
  }).select('id').single()

  if (error) throw error

  if (questionIds.length > 0) {
    await db.from('test_questions').insert(
      questionIds.map((qid, i) => ({ test_id: test.id, question_id: qid, order_index: i }))
    )
  }

  revalidatePath('/admin/tests')
  return { id: test.id }
}

export async function updateTest(id: string, formData: FormData) {
  const db = createServiceClient()
  const { error } = await db.from('tests').update({
    name:           str(formData, 'name'),
    description:    str(formData, 'description') || null,
    time_limit_sec: parseInt(str(formData, 'time_limit_sec') || '5400', 10),
    updated_at:     new Date().toISOString(),
  }).eq('id', id)

  if (error) throw error
  revalidatePath(`/admin/tests/${id}`)
  revalidatePath('/admin/tests')
  return { success: true }
}

export async function publishTest(id: string, published: boolean) {
  const db = createServiceClient()
  await db.from('tests').update({ published, updated_at: new Date().toISOString() }).eq('id', id)
  revalidatePath(`/admin/tests/${id}`)
  revalidatePath('/admin/tests')
}

export async function deleteTest(id: string) {
  const db = createServiceClient()
  await db.from('tests').delete().eq('id', id)
  redirect('/admin/tests')
}

export async function addQuestionsToTest(testId: string, questionIds: string[]) {
  const db = createServiceClient()

  // Get current max order_index
  const { data: existing } = await db
    .from('test_questions')
    .select('order_index')
    .eq('test_id', testId)
    .order('order_index', { ascending: false })
    .limit(1)

  let nextIndex = (existing?.[0]?.order_index ?? -1) + 1

  const rows = questionIds.map(qid => ({
    test_id:     testId,
    question_id: qid,
    order_index: nextIndex++,
  }))

  // upsert — ignore if already added
  await db.from('test_questions').upsert(rows, { onConflict: 'test_id,question_id', ignoreDuplicates: true })
  revalidatePath(`/admin/tests/${testId}`)
}

export async function removeQuestionFromTest(testId: string, questionId: string) {
  const db = createServiceClient()
  await db.from('test_questions')
    .delete()
    .eq('test_id', testId)
    .eq('question_id', questionId)
  revalidatePath(`/admin/tests/${testId}`)
}

export async function reorderQuestion(testId: string, questionId: string, direction: 'up' | 'down') {
  const db = createServiceClient()
  const { data: rows } = await db
    .from('test_questions')
    .select('question_id, order_index')
    .eq('test_id', testId)
    .order('order_index')

  if (!rows) return
  const idx = rows.findIndex(r => r.question_id === questionId)
  if (idx === -1) return
  const swapIdx = direction === 'up' ? idx - 1 : idx + 1
  if (swapIdx < 0 || swapIdx >= rows.length) return

  const a = rows[idx], b = rows[swapIdx]
  await db.from('test_questions').upsert([
    { test_id: testId, question_id: a.question_id, order_index: b.order_index },
    { test_id: testId, question_id: b.question_id, order_index: a.order_index },
  ])
  revalidatePath(`/admin/tests/${testId}`)
}

export async function deleteTestById(id: string) {
  const db = createServiceClient()
  await db.from('tests').delete().eq('id', id)
  revalidatePath('/admin/tests')
}

export async function toggleTestPublished(id: string, current: boolean) {
  const db = createServiceClient()
  await db.from('tests').update({ published: !current, updated_at: new Date().toISOString() }).eq('id', id)
  revalidatePath('/admin/tests')
}
