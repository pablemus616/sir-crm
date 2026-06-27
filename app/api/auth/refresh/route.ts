import { NextResponse } from 'next/server'
import { refreshSession } from '@/lib/auth/refresh'

export async function POST() {
  const token = await refreshSession()
  if (!token) {
    return NextResponse.json({ ok: false, message: 'Sesión expirada' }, { status: 401 })
  }
  return NextResponse.json({ ok: true, message: 'Sesión renovada', data: null })
}
