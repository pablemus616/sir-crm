export interface ApiSuccess<T> {
  ok: true
  message: string
  data: T
}

export interface ApiFailure {
  ok: false
  message: string
  path?: string
}

export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  limit: number
}

export class ApiError extends Error {
  readonly status: number
  readonly path?: string

  constructor(message: string, status: number, path?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.path = path
  }
}

export type ListParams = {
  page?: number
  limit?: number
} & Record<string, string | number | boolean | undefined>

export function unwrap<T>(envelope: ApiEnvelope<T> | null, status: number): T {
  if (envelope && envelope.ok) {
    return envelope.data
  }
  const message = envelope?.message ?? 'Error de red'
  const path = envelope && !envelope.ok ? envelope.path : undefined
  throw new ApiError(message, status, path)
}
