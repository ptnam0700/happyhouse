import { createServiceClient } from '@/lib/supabase/service'
import { AttendanceClient } from './AttendanceClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Điểm danh' }

export default async function AttendancePage() {
  const db = createServiceClient()
  const { data: classes } = await db
    .from('classes').select('id, name, level, teacher').in('status', ['upcoming','active']).order('name')
  return <AttendanceClient classes={classes ?? []} />
}
