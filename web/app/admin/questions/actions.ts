'use server'

import { createServiceClient } from '@/lib/supabase/service'
import { revalidatePath } from 'next/cache'

export async function toggleQuestionActive(id: string, currentActive: boolean) {
  const db = createServiceClient()
  await db.from('questions').update({ active: !currentActive }).eq('id', id)
  revalidatePath('/admin/questions')
}
