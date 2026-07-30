import { useCallback, useEffect, useState } from 'react'
import { gqlRequest } from '@/lib/graphql'

interface QueryState<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Thin wrapper around gqlRequest for read-only page-level queries — every
 * admin list/detail page follows the same loading -> data|error shape, so
 * this avoids repeating the same three useState calls everywhere.
 */
export function useAdminQuery<T>(query: string, variables?: Record<string, unknown>, deps: unknown[] = []): QueryState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const run = useCallback(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    gqlRequest<T>(query, variables)
      .then((result) => {
        if (!cancelled) setData(result)
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, tick, ...deps])

  useEffect(() => run(), [run])

  return { data, loading, error, refetch: () => setTick((t) => t + 1) }
}
