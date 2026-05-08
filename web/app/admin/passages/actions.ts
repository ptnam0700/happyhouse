'use server'

import { createServiceClient } from '@/lib/supabase/service'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ── Passage CRUD ────────────────────────────────────────────────────

function str(fd: FormData, key: string): string {
  return ((fd.get(key) ?? '') as string).trim()
}

export interface NewQuestionInput {
  type: string; level: string; question_text: string
  option_a?: string; option_b?: string; option_c?: string; option_d?: string
  correct_answer?: string; fill_answer?: string
}

export interface NewPassageInput {
  type: 'reading' | 'listening'
  title: string; level: string
  content?: string; audio_url?: string; transcript?: string
}

export async function createPassageWithQuestions(
  passage: NewPassageInput,
  questions: NewQuestionInput[],
): Promise<{ id: string }> {
  const db = createServiceClient()

  const { data, error } = await db.from('passages').insert({
    title:      passage.title.trim() || null,
    type:       passage.type,
    level:      passage.level,
    content:    passage.type === 'reading'   ? passage.content?.trim()    || null : null,
    audio_url:  passage.type === 'listening' ? passage.audio_url?.trim()  || null : null,
    transcript: passage.type === 'listening' ? passage.transcript?.trim() || null : null,
    active:     true,
  }).select('id').single()

  if (error) throw error

  if (questions.length > 0) {
    const section = passage.type === 'reading' ? 'reading' : 'listening'
    const rows = questions.map(q => ({
      passage_id:    data.id,
      section,
      active:        true,
      type:          q.type,
      level:         q.level,
      question_text: q.question_text.trim(),
      option_a:      q.option_a?.trim() || null,
      option_b:      q.option_b?.trim() || null,
      option_c:      q.option_c?.trim() || null,
      option_d:      q.option_d?.trim() || null,
      correct_answer:q.type !== 'fill_blank' ? q.correct_answer || null : null,
      fill_answer:   q.type === 'fill_blank'  ? q.fill_answer?.trim() || null : null,
    }))
    await db.from('questions').insert(rows)
  }

  revalidatePath('/admin/passages')
  return { id: data.id }
}

export async function updatePassage(id: string, formData: FormData) {
  const db = createServiceClient()
  const type = formData.get('type') as 'reading' | 'listening'
  const { error } = await db.from('passages').update({
    title:      str(formData, 'title') || null,
    level:      str(formData, 'level'),
    active:     formData.get('active') === 'true',
    content:    type === 'reading'   ? str(formData, 'content')    || null : null,
    audio_url:  type === 'listening' ? str(formData, 'audio_url')  || null : null,
    transcript: type === 'listening' ? str(formData, 'transcript') || null : null,
    updated_at: new Date().toISOString(),
  }).eq('id', id)

  if (error) throw error
  revalidatePath(`/admin/passages/${id}`)
  revalidatePath('/admin/passages')
  return { success: true }
}

export async function deletePassage(id: string) {
  const db = createServiceClient()
  // unlink questions first (keep questions but remove passage link)
  await db.from('questions').update({ passage_id: null }).eq('passage_id', id)
  await db.from('passages').delete().eq('id', id)
  redirect('/admin/passages')
}

// ── Audio upload ─────────────────────────────────────────────────────

const EXT_MIME: Record<string, string> = {
  mp3:  'audio/mpeg',
  mp4:  'audio/mp4',
  m4a:  'audio/mp4',
  ogg:  'audio/ogg',
  wav:  'audio/wav',
  mpeg: 'audio/mpeg',
}
const MAX_BYTES = 50 * 1024 * 1024 // 50 MB — matches bucket limit

export async function uploadAudio(formData: FormData): Promise<{ url: string }> {
  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) throw new Error('Không có file audio')
  if (file.size > MAX_BYTES) throw new Error('File quá lớn (tối đa 50 MB)')

  const ext = (file.name.split('.').pop() ?? 'mp3').toLowerCase()
  const contentType = file.type || EXT_MIME[ext] || 'audio/mpeg'

  if (!Object.values(EXT_MIME).includes(contentType)) {
    throw new Error(`Định dạng không hỗ trợ: ${ext}. Dùng mp3, m4a, ogg, wav.`)
  }

  // Safe filename — strip everything except alphanumeric, dash, dot
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_').toLowerCase()
  const filename  = `${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}`
  const buffer    = Buffer.from(await file.arrayBuffer())

  const db = createServiceClient()
  const { error } = await db.storage
    .from('audio')
    .upload(filename, buffer, { contentType, upsert: false })

  if (error) throw new Error(`Upload thất bại: ${error.message}`)

  const { data: { publicUrl } } = db.storage.from('audio').getPublicUrl(filename)
  return { url: publicUrl }
}

// ── Question CRUD (passage-linked) ───────────────────────────────────

function questionFields(formData: FormData) {
  const type = str(formData, 'type')
  return {
    type,
    level:          str(formData, 'level'),
    question_text:  str(formData, 'question_text'),
    option_a:       str(formData, 'option_a') || null,
    option_b:       str(formData, 'option_b') || null,
    option_c:       str(formData, 'option_c') || null,
    option_d:       str(formData, 'option_d') || null,
    correct_answer: type !== 'fill_blank' ? str(formData, 'correct_answer') || null : null,
    fill_answer:    type === 'fill_blank'  ? str(formData, 'fill_answer')    || null : null,
  }
}

export async function createQuestion(passageId: string, section: string, formData: FormData) {
  const db = createServiceClient()
  const { error } = await db.from('questions').insert({
    passage_id: passageId,
    section,
    active: true,
    ...questionFields(formData),
  })

  if (error) throw error
  revalidatePath(`/admin/passages/${passageId}`)
  revalidatePath('/admin/questions')
  return { success: true }
}

export async function updateQuestion(id: string, passageId: string, formData: FormData) {
  const db = createServiceClient()
  const { error } = await db.from('questions').update({
    ...questionFields(formData),
    updated_at: new Date().toISOString(),
  }).eq('id', id)

  if (error) throw error
  revalidatePath(`/admin/passages/${passageId}`)
  revalidatePath('/admin/questions')
  return { success: true }
}

export async function deleteQuestion(id: string, passageId: string) {
  const db = createServiceClient()
  await db.from('questions').delete().eq('id', id)
  revalidatePath(`/admin/passages/${passageId}`)
  revalidatePath('/admin/questions')
  return { success: true }
}


export async function deletePassageById(id: string) {
  const db = createServiceClient()
  await db.from('questions').update({ passage_id: null }).eq('passage_id', id)
  await db.from('passages').delete().eq('id', id)
  revalidatePath('/admin/passages')
}

export async function togglePassageActive(id: string, current: boolean) {
  const db = createServiceClient()
  await db.from('passages').update({ active: !current, updated_at: new Date().toISOString() }).eq('id', id)
  revalidatePath('/admin/passages')
}
