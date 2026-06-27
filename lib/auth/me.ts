import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { serverFetch } from '@/lib/api/server-fetch'
import { ApiError } from '@/lib/api/types'
import type { Me } from './types'

export const getMe = cache(async (): Promise<Me> => {
  try {
    return await serverFetch<Me>('/auth/me')
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect('/login')
    }
    throw error
  }
})
