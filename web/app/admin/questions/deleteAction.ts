'use server'

import { createServiceClient } from '@/lib/supabase/service'
import { revalidatePath } from 'next/cache'

export async function deleteQuestionById(id: string) {
  const db = createServiceClient()
  await db.from('questions').delete().eq('id', id)
  revalidatePath('/admin/questions')
}
