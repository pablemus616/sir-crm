// NOTE: This file is consumed from client components — those callers must include 'use client'.
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query'
import { resourceKeys } from './query-keys'
import { createResourceClient, type ResourceClient, type Id, type HttpMethod } from './resource-client'
import type { ListParams, Paginated } from './types'

/**
 * Generic useList hook for catalog fetches: useList('sectors', { limit: 200 }).
 * Returns UseQueryResult<Paginated<T>> — callers read result.data?.items.
 * Must be called only in client components (needs TanStack Query context).
 */
export function useList<T = { id: number; name: string }>(
  resource: string,
  params?: ListParams,
): UseQueryResult<Paginated<T>, Error> {
  const keys = resourceKeys(resource)
  return useQuery<Paginated<T>, Error>({
    queryKey: keys.list(params),
    queryFn: () => createResourceClient<T>(resource).list(params),
    placeholderData: (prev) => prev,
  })
}

export interface ActionVars {
  id: Id
  body?: unknown
}

export interface UseActionOptions {
  buildPath: (id: Id) => string
  method?: HttpMethod
}

export function createResourceHooks<T, C = Partial<T>, U = Partial<T>>(
  key: string,
  client: ResourceClient<T, C, U>,
) {
  const keys = resourceKeys(key)

  function useList(params?: ListParams): UseQueryResult<Paginated<T>, Error> {
    return useQuery({
      queryKey: keys.list(params),
      queryFn: () => client.list(params),
      placeholderData: (prev) => prev,
    })
  }

  function useOne(id: Id | undefined): UseQueryResult<T, Error> {
    return useQuery({
      queryKey: keys.detail(id ?? 'nil'),
      queryFn: () => client.one(id as Id),
      enabled: id !== undefined && id !== null,
    })
  }

  function useCreate(): UseMutationResult<T, Error, C> {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (dto: C) => client.create(dto),
      onSuccess: () => qc.invalidateQueries({ queryKey: keys.lists() }),
    })
  }

  function useUpdate(): UseMutationResult<T, Error, { id: Id; dto: U }> {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: ({ id, dto }) => client.update(id, dto),
      onSuccess: (_data, vars) => {
        qc.invalidateQueries({ queryKey: keys.lists() })
        qc.invalidateQueries({ queryKey: keys.detail(vars.id) })
      },
    })
  }

  function useRemove(): UseMutationResult<void, Error, Id> {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (id: Id) => client.remove(id),
      onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
    })
  }

  function useAction<R = T>(opts: UseActionOptions): UseMutationResult<R, Error, ActionVars> {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: ({ id, body }: ActionVars) =>
        client.action<R>(opts.buildPath(id), opts.method ?? 'PATCH', body),
      onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
    })
  }

  return { keys, useList, useOne, useCreate, useUpdate, useRemove, useAction }
}

export type ResourceHooks<T, C = Partial<T>, U = Partial<T>> = ReturnType<
  typeof createResourceHooks<T, C, U>
>
