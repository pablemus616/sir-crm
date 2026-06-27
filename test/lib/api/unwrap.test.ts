import { describe, expect, it } from 'vitest'
import { ApiError, unwrap, type ApiEnvelope } from '@/lib/api/types'

describe('unwrap', () => {
  it('devuelve data en éxito', () => {
    const env: ApiEnvelope<{ id: string }> = { ok: true, message: 'ok', data: { id: '1' } }
    expect(unwrap(env, 200)).toEqual({ id: '1' })
  })

  it('lanza ApiError con message del backend', () => {
    const env: ApiEnvelope<unknown> = { ok: false, message: 'Credenciales inválidas', path: '/auth/login' }
    try {
      unwrap(env, 401)
      throw new Error('no lanzó')
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError)
      expect((e as ApiError).message).toBe('Credenciales inválidas')
      expect((e as ApiError).status).toBe(401)
      expect((e as ApiError).path).toBe('/auth/login')
    }
  })

  it('lanza con mensaje por defecto si el envelope es null', () => {
    expect(() => unwrap(null, 500)).toThrow('Error de red')
  })
})
