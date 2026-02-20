/**
 * useOrderDetails Hook
 * Fetches detailed information for a specific order including items
 * Uses SWR for client-side caching and revalidation
 */

import useSWR from 'swr'

const fetcher = async (url: string) => {
  console.log(`[Hook] Fetching from ${url}`)
  
  // Get token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  const res = await fetch(url, { headers })
  
  if (!res.ok) {
    if (res.status === 401) {
      console.log('[Hook] User not authenticated')
      return null
    }
    console.error(`[Hook] API error: ${res.status}`)
    throw new Error('Failed to fetch order details')
  }
  
  return res.json()
}

export function useOrderDetails(orderId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    orderId ? `/api/orders/${orderId}` : null,
    fetcher
  )

  if (error) {
    console.error('[useOrderDetails] Error:', error)
  }

  return {
    order: data || null,
    isLoading,
    error,
    mutate,
  }
}
