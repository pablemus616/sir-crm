import { NextResponse } from 'next/server'
import { setAuthCookies } from '@/lib/auth/cookies'
import type { ApiEnvelope } from '@/lib/api/types'

interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export async function POST(request: Request) {
  const credentials = (await request.json().catch(() => null)) as
    | { username?: string; password?: string }
    | null

  if (!credentials?.username || !credentials?.password) {
    return NextResponse.json(
      { ok: false, message: 'Usuario y contraseña son obligatorios' },
      { status: 400 },
    )
  }

  const res = await fetch(`${process.env.SIR_API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: credentials.username, password: credentials.password }),
    cache: 'no-store',
  })

  const envelope = (await res.json().catch(() => null)) as ApiEnvelope<AuthTokens> | null

  if (!res.ok || !envelope || !envelope.ok) {
    return NextResponse.json(
      { ok: false, message: envelope?.message ?? 'Credenciales inválidas' },
      { status: res.status >= 400 ? res.status : 401 },
    )
  }

  await setAuthCookies(envelope.data.accessToken, envelope.data.refreshToken)
  return NextResponse.json({ ok: true, message: 'Sesión iniciada', data: null })
}
