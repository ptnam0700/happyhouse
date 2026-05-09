'use server'

import { createServiceClient } from '@/lib/supabase/service'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

function str(v: unknown) { return ((v ?? '') as string).trim() }

// ── Classes ──────────────────────────────────────────────────────────

export async function createClass(_: unknown, formData: FormData) {
  const db = createServiceClient()
  const { data, error } = await db.from('classes').insert({
    name:         str(formData.get('name')) || 'Lớp mới',
    level:        str(formData.get('level')) || null,
    teacher:      str(formData.get('teacher')) || null,
    schedule:     str(formData.get('schedule')) || null,
    room:         str(formData.get('room')) || null,
    max_students: parseInt(str(formData.get('max_students')) || '15', 10),
    start_date:   str(formData.get('start_date')) || null,
    end_date:     str(formData.get('end_date')) || null,
    status:       str(formData.get('status')) || 'upcoming',
    notes:        str(formData.get('notes')) || null,
  }).select('id').single()
  if (error) throw error
  revalidatePath('/admin/school/classes')
  redirect(`/admin/school/classes/${data.id}`)
}

export async function updateClass(id: string, formData: FormData) {
  const db = createServiceClient()
  await db.from('classes').update({
    name:         str(formData.get('name')),
    level:        str(formData.get('level')) || null,
    teacher:      str(formData.get('teacher')) || null,
    schedule:     str(formData.get('schedule')) || null,
    room:         str(formData.get('room')) || null,
    max_students: parseInt(str(formData.get('max_students')) || '15', 10),
    start_date:   str(formData.get('start_date')) || null,
    end_date:     str(formData.get('end_date')) || null,
    status:       str(formData.get('status')),
    notes:        str(formData.get('notes')) || null,
    updated_at:   new Date().toISOString(),
  }).eq('id', id)
  revalidatePath(`/admin/school/classes/${id}`)
  revalidatePath('/admin/school/classes')
  return { success: true }
}

export async function deleteClass(id: string) {
  const db = createServiceClient()
  await db.from('classes').delete().eq('id', id)
  revalidatePath('/admin/school/classes')
  redirect('/admin/school/classes')
}

// ── School students ──────────────────────────────────────────────────

export async function createSchoolStudent(_: unknown, formData: FormData) {
  const db = createServiceClient()
  const { data, error } = await db.from('school_students').insert({
    full_name:       str(formData.get('full_name')),
    phone:           str(formData.get('phone')) || null,
    email:           str(formData.get('email')) || null,
    date_of_birth:   str(formData.get('date_of_birth')) || null,
    parent_name:     str(formData.get('parent_name')) || null,
    parent_phone:    str(formData.get('parent_phone')) || null,
    enrollment_date: str(formData.get('enrollment_date')) || new Date().toISOString().slice(0, 10),
    status:          'active',
    notes:           str(formData.get('notes')) || null,
  }).select('id').single()
  if (error) throw error

  // Enroll in class if specified
  const classId = str(formData.get('class_id'))
  if (classId) {
    await db.from('student_classes').insert({
      student_id: data.id, class_id: classId,
      enrolled_at: str(formData.get('enrollment_date')) || new Date().toISOString().slice(0, 10),
    })
  }

  revalidatePath('/admin/school/students')
  redirect(`/admin/school/students/${data.id}`)
}

export async function updateSchoolStudent(id: string, formData: FormData) {
  const db = createServiceClient()
  // class_id is managed via student_classes junction — not updated here
  await db.from('school_students').update({
    full_name:       str(formData.get('full_name')),
    phone:           str(formData.get('phone')) || null,
    email:           str(formData.get('email')) || null,
    date_of_birth:   str(formData.get('date_of_birth')) || null,
    parent_name:     str(formData.get('parent_name')) || null,
    parent_phone:    str(formData.get('parent_phone')) || null,
    enrollment_date: str(formData.get('enrollment_date')) || null,
    status:          str(formData.get('status')),
    notes:           str(formData.get('notes')) || null,
    updated_at:      new Date().toISOString(),
  }).eq('id', id)
  revalidatePath(`/admin/school/students/${id}`)
  revalidatePath('/admin/school/students')
  return { success: true }
}

export async function deleteSchoolStudent(id: string) {
  const db = createServiceClient()
  await db.from('school_students').delete().eq('id', id)
  revalidatePath('/admin/school/students')
  redirect('/admin/school/students')
}

// ── Attendance ───────────────────────────────────────────────────────

export async function upsertAttendance(
  classId: string,
  sessionDate: string,
  records: { student_id: string; status: string; notes?: string }[]
) {
  const db = createServiceClient()
  const rows = records.map(r => ({
    class_id: classId, student_id: r.student_id,
    session_date: sessionDate, status: r.status, notes: r.notes ?? null,
  }))
  await db.from('attendance').upsert(rows, { onConflict: 'class_id,student_id,session_date' })
  revalidatePath('/admin/school/attendance')
  revalidatePath(`/admin/school/classes/${classId}`)
}

// Fetch students enrolled in a class — used by AttendanceClient (needs service client)
export async function getStudentsForClass(classId: string) {
  const db = createServiceClient()
  const { data } = await db.from('student_classes')
    .select('school_students(id, full_name, phone)')
    .eq('class_id', classId)
    .eq('status', 'active')
  return (data ?? []).map((r: any) => {
    const s = Array.isArray(r.school_students) ? r.school_students[0] : r.school_students
    return s ?? null
  }).filter(Boolean) as { id: string; full_name: string; phone: string | null }[]
}

export async function getAttendanceForDate(classId: string, sessionDate: string) {
  const db = createServiceClient()
  const { data } = await db.from('attendance')
    .select('student_id, status, notes')
    .eq('class_id', classId).eq('session_date', sessionDate)
  return (data ?? []) as { student_id: string; status: string; notes: string | null }[]
}

// ── Student portal accounts ──────────────────────────────────────────

function cleanPhone(phone: string) {
  return phone.replace(/\s/g, '').replace(/^\+84/, '0')
}

function phoneToEmail(phone: string) {
  return `${cleanPhone(phone)}@hh.local`
}

export async function createStudentAccount(studentId: string, phone: string, password: string) {
  const db = createServiceClient()
  const email = phoneToEmail(phone)
  const { data: existing } = await db.from('school_students').select('auth_user_id').eq('id', studentId).single()
  if (existing?.auth_user_id) await db.auth.admin.deleteUser(existing.auth_user_id)
  const { data: authUser, error } = await db.auth.admin.createUser({ email, password, email_confirm: true })
  if (error) throw error
  await db.from('school_students').update({ auth_user_id: authUser.user.id, updated_at: new Date().toISOString() }).eq('id', studentId)
  revalidatePath(`/admin/school/students/${studentId}`)
  return { email }
}

export async function resetStudentPassword(authUserId: string, newPassword: string) {
  const db = createServiceClient()
  const { error } = await db.auth.admin.updateUserById(authUserId, { password: newPassword })
  if (error) throw error
}

export async function deleteStudentAccount(authUserId: string, studentId: string) {
  const db = createServiceClient()
  await db.auth.admin.deleteUser(authUserId)
  await db.from('school_students').update({ auth_user_id: null, updated_at: new Date().toISOString() }).eq('id', studentId)
  revalidatePath(`/admin/school/students/${studentId}`)
}

// ── Class test assignments ────────────────────────────────────────────

export async function assignTestToClass(classId: string, testId: string, dueDate: string) {
  const db = createServiceClient()
  await db.from('class_tests').upsert(
    { class_id: classId, test_id: testId, due_date: dueDate || null, active: true },
    { onConflict: 'class_id,test_id' }
  )
  revalidatePath(`/admin/school/classes/${classId}`)
}

export async function removeTestFromClass(classId: string, testId: string) {
  const db = createServiceClient()
  await db.from('class_tests').delete().eq('class_id', classId).eq('test_id', testId)
  revalidatePath(`/admin/school/classes/${classId}`)
}

// ── Student ↔ Class (many-to-many via student_classes) ───────────────

export async function addStudentToClass(studentId: string, classId: string) {
  const db = createServiceClient()
  await db.from('student_classes').upsert(
    { student_id: studentId, class_id: classId, enrolled_at: new Date().toISOString().slice(0, 10), status: 'active' },
    { onConflict: 'student_id,class_id' }
  )
  revalidatePath(`/admin/school/classes/${classId}`)
  revalidatePath('/admin/school/students')
}

export async function removeStudentFromClass(studentId: string, classId: string) {
  const db = createServiceClient()
  await db.from('student_classes').delete().eq('student_id', studentId).eq('class_id', classId)
  revalidatePath(`/admin/school/classes/${classId}`)
  revalidatePath('/admin/school/students')
}
