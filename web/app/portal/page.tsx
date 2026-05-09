import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { PortalDashboard } from './PortalDashboard'

export default async function PortalPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/portal/login')

  const db = createServiceClient()

  const { data: student } = await db
    .from('school_students').select('id, full_name, status')
    .eq('auth_user_id', user.id).single()

  if (!student) redirect('/portal/login')

  const { data: enrollments } = await db
    .from('student_classes')
    .select('class_id, classes(id, name, schedule, teacher)')
    .eq('student_id', student.id).eq('status', 'active')

  const classIds = (enrollments ?? []).map((e: any) => e.class_id)

  const [{ data: classTests }, { data: myResults }] = await Promise.all([
    classIds.length
      ? db.from('class_tests')
          .select('test_id, due_date, tests(id, name, description, time_limit_sec)')
          .in('class_id', classIds).eq('active', true)
      : { data: [] },
    // Include session id so student can view result detail
    db.from('test_sessions')
      .select('id, test_id, total_correct, total_questions, submitted_at, band_score')
      .eq('school_student_id', student.id)
      .order('submitted_at', { ascending: false }),
  ])

  // Most recent session per test (for score display)
  const latestByTest = new Map<string, any>()
  ;(myResults ?? []).forEach((r: any) => {
    if (!latestByTest.has(r.test_id)) latestByTest.set(r.test_id, r)
  })

  const testMap = new Map<string, any>()
  ;(classTests ?? []).forEach((ct: any) => {
    if (!testMap.has(ct.test_id)) {
      const t = Array.isArray(ct.tests) ? ct.tests[0] : ct.tests
      const latest = latestByTest.get(ct.test_id)
      testMap.set(ct.test_id, {
        test_id:        ct.test_id,
        name:           t?.name ?? 'Bài test',
        description:    t?.description ?? null,
        time_limit_sec: t?.time_limit_sec ?? 5400,
        due_date:       ct.due_date,
        done:           latestByTest.has(ct.test_id),
        latest_session_id:      latest?.id ?? null,
        latest_total_correct:   latest?.total_correct ?? null,
        latest_total_questions: latest?.total_questions ?? null,
        latest_band:            latest?.band_score ?? null,
        latest_submitted_at:    latest?.submitted_at ?? null,
      })
    }
  })

  const classes = (enrollments ?? []).map((e: any) => {
    const cls = Array.isArray(e.classes) ? e.classes[0] : e.classes
    return { id: e.class_id, name: cls?.name ?? '', schedule: cls?.schedule ?? null, teacher: cls?.teacher ?? null }
  })

  return (
    <PortalDashboard
      student={{ id: student.id, full_name: student.full_name }}
      classes={classes}
      tests={Array.from(testMap.values())}
      allResults={(myResults ?? []).map((r: any) => ({
        id: r.id, test_id: r.test_id, total_correct: r.total_correct,
        total_questions: r.total_questions, submitted_at: r.submitted_at,
      }))}
    />
  )
}
