'use server'

import { createServiceClient } from '@/lib/supabase/service'
import { revalidatePath } from 'next/cache'

export async function updateStudent(id: string, data: {
  full_name: string; phone: string; email: string
}) {
  const db = createServiceClient()
  await db.from('students').update({
    full_name:  data.full_name.trim(),
    phone:      data.phone.trim(),
    email:      data.email.trim() || null,
    updated_at: new Date().toISOString(),
  }).eq('id', id)
  revalidatePath('/admin/students')
}

export async function deleteStudent(id: string) {
  const db = createServiceClient()
  // test_sessions cascade-deletes via FK
  await db.from('students').delete().eq('id', id)
  revalidatePath('/admin/students')
}
