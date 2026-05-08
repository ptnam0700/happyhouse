'use server'

import { createServiceClient } from '@/lib/supabase/service'
import { revalidatePath } from 'next/cache'

export async function deleteSession(id: string) {
  const db = createServiceClient()
  await db.from('test_sessions').delete().eq('id', id)
  revalidatePath('/admin/sessions')
}
