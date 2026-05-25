'use server'

import { createServiceClient } from '@/lib/supabase/service'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createStandaloneQuestion(formData: FormData) {
  const db = createServiceClient()
  const type = formData.get('type') as string

  const { data, error } = await db.from('questions').insert({
    section:       formData.get('section') as string,
    type,
    level:         formData.get('level') as string,
    question_text: (formData.get('question_text') as string).trim(),
    option_a:      (formData.get('option_a') as string)?.trim() || null,
    option_b:      (formData.get('option_b') as string)?.trim() || null,
    option_c:      (formData.get('option_c') as string)?.trim() || null,
    option_d:      (formData.get('option_d') as string)?.trim() || null,
    correct_answer:type !== 'fill_blank' ? (formData.get('correct_answer') as string) || null : null,
    fill_answer:   type === 'fill_blank'  ? (formData.get('fill_answer') as string)?.trim() || null : null,
    passage_id:    null,
    active:        true,
  }).select('id').single()

  if (error) throw error
  revalidatePath('/admin/questions')
  redirect('/admin/questions')
}

export async function updateStandaloneQuestion(id: string, formData: FormData) {
  const db = createServiceClient()
  const type = formData.get('type') as string

  const { error } = await db.from('questions').update({
    section:       formData.get('section') as string,
    type,
    level:         formData.get('level') as string,
    question_text: (formData.get('question_text') as string).trim(),
    option_a:      (formData.get('option_a') as string)?.trim() || null,
    option_b:      (formData.get('option_b') as string)?.trim() || null,
    option_c:      (formData.get('option_c') as string)?.trim() || null,
    option_d:      (formData.get('option_d') as string)?.trim() || null,
    correct_answer:type !== 'fill_blank' ? (formData.get('correct_answer') as string) || null : null,
    fill_answer:   type === 'fill_blank'  ? (formData.get('fill_answer') as string)?.trim() || null : null,
    updated_at:    new Date().toISOString(),
  }).eq('id', id)

  if (error) throw error
  revalidatePath('/admin/questions')
  redirect('/admin/questions')
}

export async function importQuestionsFromJson(rows: unknown[]): Promise<{ inserted: number; errors: string[] }> {
  const db = createServiceClient()
  const VALID_SECTIONS = ['grammar', 'vocabulary', 'reading', 'listening']
  const VALID_TYPES    = ['multiple_choice', 'fill_blank', 'reading', 'listening', 'true_false']
  const VALID_LEVELS   = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  const VALID_ANSWERS  = ['A', 'B', 'C', 'D']

  const valid: Record<string, unknown>[] = []
  const errors: string[] = []

  for (let i = 0; i < rows.length; i++) {
    const q = rows[i] as Record<string, unknown>
    const label = `#${i + 1}`
    if (!q.section || !VALID_SECTIONS.includes(q.section as string)) { errors.push(`${label}: invalid section "${q.section}"`); continue }
    if (!q.type    || !VALID_TYPES.includes(q.type as string))        { errors.push(`${label}: invalid type "${q.type}"`);    continue }
    if (!q.question_text)                                              { errors.push(`${label}: missing question_text`);       continue }
    if (q.level && !VALID_LEVELS.includes(q.level as string))         { errors.push(`${label}: invalid level "${q.level}"`); continue }
    if (q.type !== 'fill_blank' && q.correct_answer && !VALID_ANSWERS.includes(q.correct_answer as string)) {
      errors.push(`${label}: invalid correct_answer "${q.correct_answer}"`); continue
    }
    valid.push({
      section:       q.section,
      type:          q.type,
      level:         VALID_LEVELS.includes(q.level as string) ? q.level : 'B1',
      question_text: String(q.question_text).trim(),
      option_a:      q.option_a ? String(q.option_a).trim() : null,
      option_b:      q.option_b ? String(q.option_b).trim() : null,
      option_c:      q.option_c ? String(q.option_c).trim() : null,
      option_d:      q.option_d ? String(q.option_d).trim() : null,
      correct_answer:q.type !== 'fill_blank' ? (q.correct_answer as string | null) ?? null : null,
      fill_answer:   q.type === 'fill_blank'  ? (q.fill_answer ? String(q.fill_answer).trim() : null) : null,
      explanation:   q.explanation ? String(q.explanation).trim() : null,
      topic_tags:    Array.isArray(q.topic_tags) ? q.topic_tags : [],
      active:        true,
    })
  }

  if (valid.length > 0) {
    const { error } = await db.from('questions').insert(valid)
    if (error) throw new Error(error.message)
  }

  revalidatePath('/admin/questions')
  return { inserted: valid.length, errors }
}

export async function deleteStandaloneQuestion(id: string) {
  const db = createServiceClient()
  await db.from('questions').delete().eq('id', id)
  revalidatePath('/admin/questions')
  redirect('/admin/questions')
}
