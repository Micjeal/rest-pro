/**
 * useRestaurants Hook
 * Fetches all restaurants for the authenticated user
 * Uses SWR for client-side caching and revalidation
 */

import useSWR from 'swr'

const fetcher = async (url: string) => {
  console.log(`[Hook] Fetching from ${url}`)
  
  const token = localStorage.getItem('auth_token')
  console.log('[Hook] Token from localStorage:', token ? 'exists' : 'missing')
  
  const headers: Record<string, string> = {}
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
    console.log('[Hook] Added Authorization header')
  } else {
    console.log('[Hook] No token available, request will be unauthenticated')
  }
  
  console.log('[Hook] Making request with headers:', headers)
  
  try {
    const res = await fetch(url, { headers })
    console.log('[Hook] Response status:', res.status)
    console.log('[Hook] Response headers:', Object.fromEntries(res.headers.entries()))
    
    if (!res.ok) {
      if (res.status === 401) {
        console.log('[Hook] User not authenticated (401)')
        return null
      }
      console.error(`[Hook] API error: ${res.status}`)
      const errorText = await res.text()
      console.error('[Hook] Error response body:', errorText)
      throw new Error(`Failed to fetch restaurants (${res.status}): ${errorText}`)
    }
    
    const data = await res.json()
    console.log('[Hook] Response data:', data)
    console.log('[Hook] Data type:', typeof data)
    console.log('[Hook] Data length:', Array.isArray(data) ? data.length : 'not array')
    
    return data
  } catch (error) {
    console.error('[Hook] Fetch error:', error)
    throw error
  }
}

export function useRestaurants() {
  const { data, error, isLoading, mutate } = useSWR('/api/restaurants', fetcher)

  // Debug logging for SWR state
  console.log('[useRestaurants] SWR state:', {
    data: data,
    dataType: typeof data,
    dataLength: Array.isArray(data) ? data.length : 'not array',
    error,
    isLoading,
    hasData: !!data,
    hasError: !!error
  })

  if (error) {
    console.error('[useRestaurants] Error:', error)
  }

  const restaurants = data || []
  console.log('[useRestaurants] Returning restaurants:', restaurants.length, 'items')

  return {
    restaurants,
    isLoading,
    error,
    mutate,
  }
}
