import 'server-only'
import { cookies } from 'next/headers'
import {
  ACCESS_COOKIE,
  ACCESS_MAX_AGE,
  REFRESH_COOKIE,
  REFRESH_MAX_AGE,
  baseCookieOptions as baseOptions,
} from './cookie-config'

export { ACCESS_COOKIE, REFRESH_COOKIE }

export async function getAccessToken(): Promise<string | undefined> {
  return (await cookies()).get(ACCESS_COOKIE)?.value
}

export async function getRefreshToken(): Promise<string | undefined> {
  return (await cookies()).get(REFRESH_COOKIE)?.value
}

export async function setAuthCookies(accessToken: string, refreshToken: string): Promise<void> {
  const store = await cookies()
  store.set(ACCESS_COOKIE, accessToken, { ...baseOptions, maxAge: ACCESS_MAX_AGE })
  store.set(REFRESH_COOKIE, refreshToken, { ...baseOptions, maxAge: REFRESH_MAX_AGE })
}

export async function clearAuthCookies(): Promise<void> {
  const store = await cookies()
  store.delete(ACCESS_COOKIE)
  store.delete(REFRESH_COOKIE)
}
