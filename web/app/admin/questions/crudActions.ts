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

export async function deleteStandaloneQuestion(id: string) {
  const db = createServiceClient()
  await db.from('questions').delete().eq('id', id)
  revalidatePath('/admin/questions')
  redirect('/admin/questions')
}
