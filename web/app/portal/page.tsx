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
    .from('school_students')
    .select('id, full_name, status')
    .eq('auth_user_id', user.id)
    .single()

  if (!student) redirect('/portal/login')

  // All classes this student is enrolled in
  const { data: enrollments } = await db
    .from('student_classes')
    .select('class_id, classes(id, name, schedule, teacher)')
    .eq('student_id', student.id)
    .eq('status', 'active')

  const classIds = (enrollments ?? []).map((e: any) => e.class_id)

  // Tests assigned to any of the student's classes + their results
  const [{ data: classTests }, { data: myResults }] = await Promise.all([
    classIds.length
      ? db.from('class_tests')
          .select('test_id, due_date, tests(id, name, description, time_limit_sec)')
          .in('class_id', classIds).eq('active', true)
      : { data: [] },
    db.from('test_sessions')
      .select('test_id, total_correct, total_questions, submitted_at')
      .eq('school_student_id', student.id)
      .order('submitted_at', { ascending: false }),
  ])

  const doneTestIds = new Set((myResults ?? []).map((r: any) => r.test_id))

  // Deduplicate: same test may be in multiple classes
  const testMap = new Map<string, any>()
  ;(classTests ?? []).forEach((ct: any) => {
    if (!testMap.has(ct.test_id)) {
      const t = Array.isArray(ct.tests) ? ct.tests[0] : ct.tests
      testMap.set(ct.test_id, {
        test_id: ct.test_id, name: t?.name ?? 'Bài test',
        description: t?.description ?? null, time_limit_sec: t?.time_limit_sec ?? 5400,
        due_date: ct.due_date, done: doneTestIds.has(ct.test_id),
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
      results={(myResults ?? []).map((r: any) => ({
        test_id: r.test_id, total_correct: r.total_correct,
        total_questions: r.total_questions, submitted_at: r.submitted_at,
      }))}
    />
  )
}
