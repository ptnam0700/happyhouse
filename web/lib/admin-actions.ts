'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createSessionToken, COOKIE_NAME } from './admin-auth'

export async function loginAction(_: unknown, formData: FormData) {
  const password = formData.get('password') as string
  const expected = process.env.ADMIN_PASSWORD

  if (!expected || !password || password !== expected) {
    return { error: 'Mật khẩu không đúng' }
  }

  const token = await createSessionToken()
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  redirect('/admin/dashboard')
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
  redirect('/admin/login')
}
