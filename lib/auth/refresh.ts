import 'server-only'
import { getRefreshToken, setAuthCookies } from './cookies'
import type { ApiEnvelope } from '@/lib/api/types'

interface AuthTokens {
  accessToken: string
  refreshToken: string
}

/**
 * Llama POST {SIR_API_URL}/auth/refresh con sir_refresh, rota ambas cookies y
 * devuelve el nuevo accessToken. Devuelve null (y limpia cookies) si falla.
 * Los writes van en try/catch porque cookies().set lanza durante el render de un
 * Server Component; en ese contexto el token igual sirve para el reintento en vuelo.
 */
export async function refreshSession(): Promise<string | null> {
  const refreshToken = await getRefreshToken()
  if (!refreshToken) return null

  const res = await fetch(`${process.env.SIR_API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
    cache: 'no-store',
  })

  const envelope = (await res.json().catch(() => null)) as ApiEnvelope<AuthTokens> | null

  if (!res.ok || !envelope || !envelope.ok) {
    // No limpiamos: un fallo aquí puede ser una carrera con un refresh concurrente
    // válido (p.ej. el proxy). Borrar pisaría la cookie buena. La sesión muerta
    // termina en /login por getMe / el redirect del cliente.
    return null
  }

  try {
    await setAuthCookies(envelope.data.accessToken, envelope.data.refreshToken)
  } catch {
    // Contexto de render: no se puede persistir. Con el proxy refrescando antes del
    // render esto casi no ocurre; si ocurre, el token sirve para el reintento en vuelo.
  }
  return envelope.data.accessToken
}
