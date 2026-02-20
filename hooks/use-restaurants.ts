/**
 * useRestaurants Hook
 * Fetches all restaurants for the authenticated user
 * Uses SWR for client-side caching and revalidation
 */

import useSWR from 'swr'

const fetcher = async (url: string) => {
  console.log(`[Hook] Fetching from ${url}`)
  
  const token = localStorage.getItem('auth_token')
  const headers: Record<string, string> = {}
  
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
    throw new Error('Failed to fetch restaurants')
  }
  
  return res.json()
}

export function useRestaurants() {
  const { data, error, isLoading, mutate } = useSWR('/api/restaurants', fetcher)

  if (error) {
    console.error('[useRestaurants] Error:', error)
  }

  return {
    restaurants: data || [],
    isLoading,
    error,
    mutate,
  }
}
