import { describe, expect, it } from 'vitest'
import { loginSchema } from '@/lib/auth/login-schema'

describe('loginSchema', () => {
  it('acepta credenciales válidas', () => {
    expect(loginSchema.safeParse({ username: 'admin', password: 'secret' }).success).toBe(true)
  })

  it('rechaza usuario vacío', () => {
    const r = loginSchema.safeParse({ username: '  ', password: 'secret' })
    expect(r.success).toBe(false)
  })

  it('rechaza contraseña vacía', () => {
    expect(loginSchema.safeParse({ username: 'admin', password: '' }).success).toBe(false)
  })
})
