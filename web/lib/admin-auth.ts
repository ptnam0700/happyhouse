const COOKIE_NAME = 'admin_session'
const SALT = 'happyhouse-admin-2025'

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + SALT)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function createSessionToken(): Promise<string> {
  const password = process.env.ADMIN_PASSWORD ?? ''
  return hashPassword(password)
}

export async function verifySessionToken(token: string): Promise<boolean> {
  const expected = await createSessionToken()
  return token === expected
}

export { COOKIE_NAME }
