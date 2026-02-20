/**
 * useInventory Hook
 * Fetches all inventory items for the specified restaurant
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
    throw new Error('Failed to fetch inventory')
  }
  
  return res.json()
}

export function useInventory(restaurantId: string | null) {
  // Validate restaurantId format before making the request
  const isValidUUID = restaurantId && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(restaurantId)
  
  const { data, error, isLoading, mutate } = useSWR(
    isValidUUID ? `/api/inventory?restaurantId=${restaurantId}` : null,
    fetcher
  )

  if (error) {
    console.error('[useInventory] Error:', error)
  }

  return {
    inventory: data || [],
    isLoading,
    error,
    mutate,
  }
}
