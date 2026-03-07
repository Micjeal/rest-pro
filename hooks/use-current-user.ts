/**
 * @fileoverview Current User Hook
 * Custom hook to get the currently logged-in user information
 */

import { useState, useEffect } from 'react'

export interface CurrentUser {
  id: string
  email: string
  name: string
  role: string
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const token = localStorage.getItem('auth_token')
        if (!token) {
          setError('No authentication token found')
          setLoading(false)
          return
        }

        // Decode the token to get user info
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
        
        // Fetch full user information from database
        const response = await fetch('/api/users/current', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        } else {
          // Fallback to token data if API fails
          setUser({
            id: decoded.userId,
            email: decoded.email,
            name: decoded.name || decoded.email,
            role: decoded.role || 'cashier'
          })
        }
      } catch (err) {
        console.error('[useCurrentUser] Error:', err)
        setError('Failed to get current user')
      } finally {
        setLoading(false)
      }
    }

    getCurrentUser()
  }, [])

  return { user, loading, error }
}
