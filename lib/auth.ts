import { cookies } from "next/headers"

const SESSION_COOKIE = "vartel_session"
const SESSION_DURATION = 60 * 60 * 24 * 7 // 7 days

function hashToken(secret: string, timestamp: string): string {
  // Simple HMAC-like hash using btoa for edge compatibility
  const data = `${secret}:${timestamp}:vartel-admin`
  return btoa(data).replace(/[^a-zA-Z0-9]/g, "").slice(0, 48)
}

export function createSessionToken(): string {
  const secret = process.env.SESSION_SECRET!
  const timestamp = Date.now().toString()
  const hash = hashToken(secret, timestamp)
  return `${timestamp}.${hash}`
}

export function verifySessionToken(token: string): boolean {
  try {
    const secret = process.env.SESSION_SECRET!
    const [timestamp, hash] = token.split(".")
    if (!timestamp || !hash) return false

    const expected = hashToken(secret, timestamp)
    if (hash !== expected) return false

    const age = Date.now() - parseInt(timestamp)
    return age < SESSION_DURATION * 1000
  } catch {
    return false
  }
}

export async function setSessionCookie(): Promise<void> {
  const token = createSessionToken()
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION,
    path: "/",
  })
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return false
  return verifySessionToken(token)
}
