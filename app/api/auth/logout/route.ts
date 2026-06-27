import { NextResponse } from 'next/server'
import { clearAuthCookies, getAccessToken } from '@/lib/auth/cookies'

export async function POST() {
  const token = await getAccessToken()
  if (token) {
    await fetch(`${process.env.SIR_API_URL}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    }).catch(() => undefined)
  }
  await clearAuthCookies()
  return NextResponse.json({ ok: true, message: 'Sesión cerrada', data: null })
}
