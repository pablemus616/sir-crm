import { ACCESS_COOKIE, REFRESH_COOKIE } from './cookie-names'

export { ACCESS_COOKIE, REFRESH_COOKIE }

/**
 * Configuración de cookies de sesión, sin dependencias de `next/headers`, para
 * poder compartirse entre los helpers de servidor (`lib/auth/cookies.ts`) y el
 * `proxy.ts` (que escribe cookies sobre la respuesta).
 *
 * Los max-age deben coincidir con los TTL del backend (sir-api .env:
 * JWT_ACCESS_TTL=15m, JWT_REFRESH_TTL=30d) para que el navegador no descarte una
 * cookie que el backend todavía honraría.
 */
export const ACCESS_MAX_AGE = 60 * 15 // 15 min
export const REFRESH_MAX_AGE = 60 * 60 * 24 * 30 // 30 días

export const baseCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
} as const
