'use server'

import { createServiceClient } from '@/lib/supabase/service'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ── Collections ──────────────────────────────────────────────────────

export async function getCollections(studentId: string) {
  const db = createServiceClient()
  const { data } = await db
    .from('vocab_collections')
    .select('id, name, description, color, created_at, updated_at')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function createCollection(studentId: string, data: { name: string; description: string; color: string }) {
  const db = createServiceClient()
  const { data: c, error } = await db.from('vocab_collections')
    .insert({ student_id: studentId, name: data.name.trim(), description: data.description.trim() || null, color: data.color })
    .select('id').single()
  if (error) throw error
  revalidatePath('/portal/vocab')
  redirect(`/portal/vocab/${c.id}`)
}

export async function updateCollection(id: string, data: { name: string; description: string; color: string }) {
  const db = createServiceClient()
  await db.from('vocab_collections').update({ name: data.name.trim(), description: data.description.trim() || null, color: data.color, updated_at: new Date().toISOString() }).eq('id', id)
  revalidatePath('/portal/vocab')
  revalidatePath(`/portal/vocab/${id}`)
}

export async function deleteCollection(id: string) {
  const db = createServiceClient()
  await db.from('vocab_collections').delete().eq('id', id)
  revalidatePath('/portal/vocab')
  redirect('/portal/vocab')
}

// ── Words ────────────────────────────────────────────────────────────

export async function getWords(collectionId: string) {
  const db = createServiceClient()
  const { data } = await db
    .from('vocab_words')
    .select('*')
    .eq('collection_id', collectionId)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function getWord(wordId: string) {
  const db = createServiceClient()
  const { data } = await db.from('vocab_words').select('*').eq('id', wordId).single()
  return data
}

export async function upsertWord(collectionId: string, data: {
  id?: string; word: string; pronunciation?: string; part_of_speech?: string
  definition?: string; definition_vi?: string; example_sentence?: string
  example_sentence_vi?: string; synonyms?: string[]; antonyms?: string[]
  related_words?: string[]; image_url?: string; notes?: string
  difficulty?: string; tags?: string[]
}) {
  const db = createServiceClient()
  const payload = {
    collection_id: collectionId, word: data.word.trim(),
    pronunciation: data.pronunciation || null, part_of_speech: data.part_of_speech || null,
    definition: data.definition || null, definition_vi: data.definition_vi || null,
    example_sentence: data.example_sentence || null, example_sentence_vi: data.example_sentence_vi || null,
    synonyms: data.synonyms ?? [], antonyms: data.antonyms ?? [], related_words: data.related_words ?? [],
    image_url: data.image_url || null, notes: data.notes || null,
    difficulty: data.difficulty || 'medium', tags: data.tags ?? [],
    updated_at: new Date().toISOString(),
  }
  if (data.id) {
    await db.from('vocab_words').update(payload).eq('id', data.id)
  } else {
    await db.from('vocab_words').insert(payload)
  }
  revalidatePath(`/portal/vocab/${collectionId}`)
  redirect(`/portal/vocab/${collectionId}`)
}

export async function deleteWord(wordId: string, collectionId: string) {
  const db = createServiceClient()
  await db.from('vocab_words').delete().eq('id', wordId)
  revalidatePath(`/portal/vocab/${collectionId}`)
}

export async function bulkImportWords(collectionId: string, rows: { word: string; definition?: string; definition_vi?: string; example_sentence?: string; synonyms?: string[]; tags?: string[] }[]) {
  const db = createServiceClient()
  const payload = rows.filter(r => r.word?.trim()).map(r => ({
    collection_id: collectionId, word: r.word.trim(),
    definition: r.definition || null, definition_vi: r.definition_vi || null,
    example_sentence: r.example_sentence || null,
    synonyms: r.synonyms ?? [], antonyms: [], related_words: [],
    tags: r.tags ?? [], difficulty: 'medium',
  }))
  await db.from('vocab_words').insert(payload)
  revalidatePath(`/portal/vocab/${collectionId}`)
}

// ── Progress ─────────────────────────────────────────────────────────

export async function getProgress(studentId: string, collectionId: string) {
  const db = createServiceClient()
  const { data } = await db
    .from('vocab_progress')
    .select('word_id, status, correct_count, incorrect_count, streak, next_review')
    .eq('student_id', studentId)
    .in('word_id', await db.from('vocab_words').select('id').eq('collection_id', collectionId).then(r => r.data?.map(w => w.id) ?? []))
  return Object.fromEntries((data ?? []).map(p => [p.word_id, p]))
}

export async function recordAnswer(wordId: string, studentId: string, correct: boolean) {
  const db = createServiceClient()
  const { data: existing } = await db.from('vocab_progress').select('*').eq('word_id', wordId).eq('student_id', studentId).single()

  const streak       = correct ? (existing?.streak ?? 0) + 1 : 0
  const correctCount = (existing?.correct_count ?? 0) + (correct ? 1 : 0)
  const wrongCount   = (existing?.incorrect_count ?? 0) + (correct ? 0 : 1)

  // Spaced repetition: days until next review
  const daysMap = [1, 1, 3, 7, 14, 30]
  const daysAhead = correct ? (daysMap[Math.min(streak, daysMap.length - 1)] ?? 30) : 1
  const nextReview = new Date(); nextReview.setDate(nextReview.getDate() + daysAhead)

  const status = correctCount >= 5 && streak >= 3 ? 'mastered'
    : correctCount >= 3 ? 'review'
    : correctCount >= 1 ? 'learning' : 'new'

  await db.from('vocab_progress').upsert({
    word_id: wordId, student_id: studentId, status,
    correct_count: correctCount, incorrect_count: wrongCount,
    streak, last_reviewed: new Date().toISOString(),
    next_review: nextReview.toISOString(),
  }, { onConflict: 'word_id,student_id' })
}
