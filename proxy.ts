import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { ApiEnvelope } from '@/lib/api/types'
import {
  ACCESS_COOKIE,
  ACCESS_MAX_AGE,
  REFRESH_COOKIE,
  REFRESH_MAX_AGE,
  baseCookieOptions,
} from '@/lib/auth/cookie-config'

/**
 * Proxy (antes `middleware`, renombrado en Next 16 y ahora en runtime Node.js).
 * Corre ANTES de que rendericen los Server Components, y aquí SÍ se pueden escribir
 * cookies — a diferencia del render, donde `cookies().set()` lanza.
 *
 * Mantiene el access token fresco: dura 15 min y el backend rota el refresh en
 * cada uso. Si el refresh ocurriera durante el render, el token rotado se perdería
 * (no se puede persistir) y la sesión se caería a los ~15 min. Por eso, cuando el
 * access expiró, aquí pedimos un par nuevo, lo INYECTAMOS en el request (para que
 * `getMe()` lo lea en esta misma petición) y lo persistimos en la respuesta.
 *
 * La sesión se considera válida solo si el access está vigente o si se logró
 * refrescar — nunca por mera presencia de la cookie de refresh (eso causaba que un
 * refresh viejo rebotara al usuario fuera de /login en bucle). No limpiamos cookies
 * en fallo para no pisar un refresh concurrente válido; `getMe()` sigue siendo la
 * barrera real de autorización.
 */

const PUBLIC_PATHS = ['/login']

/** Decodifica (sin verificar firma) el `exp` del JWT para saber si conviene refrescar. */
function accessTokenExpired(token: string, bufferSeconds = 30): boolean {
  const first = token.indexOf('.')
  const second = token.indexOf('.', first + 1)
  if (first < 0 || second < 0) return true
  try {
    const payload = JSON.parse(
      Buffer.from(token.slice(first + 1, second), 'base64url').toString('utf8'),
    ) as { exp?: number }
    if (typeof payload.exp !== 'number') return true
    return payload.exp * 1000 <= Date.now() + bufferSeconds * 1000
  } catch {
    return true
  }
}

interface AuthTokens {
  accessToken: string
  refreshToken: string
}

/** Rota el par de tokens contra el backend. Devuelve null si falla. */
async function refreshTokens(refreshToken: string): Promise<AuthTokens | null> {
  try {
    const res = await fetch(`${process.env.SIR_API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (!res.ok) return null
    const envelope = (await res.json().catch(() => null)) as ApiEnvelope<AuthTokens> | null
    if (!envelope || !envelope.ok) return null
    return envelope.data
  } catch {
    return null
  }
}

/**
 * Reenvía la petición con el header Cookie reconstruido, para que el render de
 * ESTA misma petición lea el token recién rotado (sin depender de detalles internos
 * de cómo `request.cookies.set` reescribe el header).
 */
function nextWithInjectedCookies(request: NextRequest, tokens: AuthTokens): NextResponse {
  const jar = new Map(request.cookies.getAll().map((c) => [c.name, c.value]))
  jar.set(ACCESS_COOKIE, tokens.accessToken)
  jar.set(REFRESH_COOKIE, tokens.refreshToken)
  const headers = new Headers(request.headers)
  headers.set('cookie', Array.from(jar, ([name, value]) => `${name}=${value}`).join('; '))
  return NextResponse.next({ request: { headers } })
}

/** Escribe el par nuevo en la respuesta (Set-Cookie) para las próximas peticiones. */
function persist(response: NextResponse, tokens: AuthTokens): NextResponse {
  response.cookies.set(ACCESS_COOKIE, tokens.accessToken, {
    ...baseCookieOptions,
    maxAge: ACCESS_MAX_AGE,
  })
  response.cookies.set(REFRESH_COOKIE, tokens.refreshToken, {
    ...baseCookieOptions,
    maxAge: REFRESH_MAX_AGE,
  })
  return response
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname, search } = request.nextUrl
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))

  const access = request.cookies.get(ACCESS_COOKIE)?.value
  const refresh = request.cookies.get(REFRESH_COOKIE)?.value

  let authed = Boolean(access && !accessTokenExpired(access))
  let refreshed: AuthTokens | null = null
  if (!authed && refresh) {
    refreshed = await refreshTokens(refresh)
    authed = refreshed !== null
  }

  const redirectTo = (target: string, withRedirectParam = false): NextResponse => {
    const url = request.nextUrl.clone()
    url.pathname = target
    url.search = ''
    if (withRedirectParam) url.searchParams.set('redirect', pathname + search)
    const res = NextResponse.redirect(url)
    // Un refresh exitoso persiste en el redirect: el navegador vuelve con la cookie nueva.
    return refreshed ? persist(res, refreshed) : res
  }

  // Raíz: rebota al lugar correcto según sesión.
  if (pathname === '/') {
    return authed ? redirectTo('/dashboard') : redirectTo('/login')
  }

  // Autenticado en una ruta pública (login) → al dashboard.
  if (authed && isPublic) {
    return redirectTo('/dashboard')
  }

  // No autenticado en ruta protegida → al login (guardando a dónde iba).
  if (!authed && !isPublic) {
    return redirectTo('/login', true)
  }

  // Continuar. Si hubo refresh, inyecta el token en el request y persiste en la respuesta.
  if (refreshed) {
    return persist(nextWithInjectedCookies(request, refreshed), refreshed)
  }
  return NextResponse.next()
}

export const config = {
  // Excluye API (incluido /api/auth y /api/proxy), assets de _next y archivos con extensión.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
