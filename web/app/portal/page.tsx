import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { PortalDashboard } from './PortalDashboard'

export default async function PortalPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/portal/login')

  const db = createServiceClient()

  // Find the enrolled student by their auth user id
  const { data: student } = await db
    .from('school_students')
    .select('id, full_name, status, class_id, classes(id, name, schedule, teacher, level)')
    .eq('auth_user_id', user.id)
    .single()

  if (!student) {
    // Account exists in auth but not linked to a student record
    redirect('/portal/login')
  }

  // Get tests assigned to their class
  const [{ data: classTests }, { data: myResults }] = await Promise.all([
    student.class_id
      ? db.from('class_tests')
          .select('test_id, due_date, active, tests(id, name, description, time_limit_sec)')
          .eq('class_id', student.class_id)
          .eq('active', true)
          .order('assigned_at', { ascending: false })
      : { data: [] },
    db.from('test_sessions')
      .select('test_id, total_correct, total_questions, submitted_at')
      .eq('school_student_id', student.id)
      .order('submitted_at', { ascending: false }),
  ])

  const cls = Array.isArray(student.classes) ? student.classes[0] : student.classes
  const doneTestIds = new Set((myResults ?? []).map((r: any) => r.test_id))

  const tests = (classTests ?? []).map((ct: any) => {
    const t = Array.isArray(ct.tests) ? ct.tests[0] : ct.tests
    return {
      test_id:        ct.test_id,
      name:           t?.name ?? 'Bài test',
      description:    t?.description ?? null,
      time_limit_sec: t?.time_limit_sec ?? 5400,
      due_date:       ct.due_date,
      done:           doneTestIds.has(ct.test_id),
    }
  })

  const results = (myResults ?? []).map((r: any) => ({
    test_id:         r.test_id,
    total_correct:   r.total_correct,
    total_questions: r.total_questions,
    submitted_at:    r.submitted_at,
  }))

  return (
    <PortalDashboard
      student={{ id: student.id, full_name: student.full_name }}
      className={cls?.name ?? null}
      classSchedule={cls?.schedule ?? null}
      classTeacher={cls?.teacher ?? null}
      tests={tests}
      results={results}
    />
  )
}
