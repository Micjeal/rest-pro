/**
 * @fileoverview Users Hook
 * Custom hook for user management with SWR integration
 */

import useSWR, { mutate } from 'swr'
import { useState } from 'react'
import { type RestaurantRole } from '@/components/users/role-definitions'

// Types
export interface User {
  id: string
  email: string
  name: string
  role: RestaurantRole
  created_at: string
  updated_at: string
}

export interface CreateUserData {
  email: string
  name: string
  role: RestaurantRole
  password: string
}

export interface UpdateUserData {
  email?: string
  name?: string
  role?: RestaurantRole
  password?: string
}

export interface UsersResponse {
  users: User[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// API fetcher function
const fetcher = async (url: string): Promise<any> => {
  const token = localStorage.getItem('auth_token')
  if (!token) {
    throw new Error('No authentication token')
  }

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch data')
  }

  return response.json()
}

// Main users hook
export function useUsers(page = 1, limit = 10, search = '', role = 'all') {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
    ...(role && role !== 'all' && { role })
  })

  const { data, error, isLoading, mutate } = useSWR<UsersResponse>(
    `/api/users?${params}`,
    fetcher
  )

  return {
    users: data?.users || [],
    pagination: data?.pagination || { page: 1, limit: 10, total: 0, pages: 0 },
    isLoading,
    error,
    mutate
  }
}

// Single user hook
export function useUser(id: string) {
  const { data, error, isLoading, mutate } = useSWR<{ user: User }>(
    id ? `/api/users/${id}` : null,
    fetcher
  )

  return {
    user: data?.user,
    isLoading,
    error,
    mutate
  }
}

// Create user hook
export function useCreateUser() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createUser = async (userData: CreateUserData) => {
    setIsLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('No authentication token')
      }

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user')
      }

      // Invalidate users cache to refresh list
      await mutate('/api/users')

      return data.user
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create user'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { createUser, isLoading, error }
}

// Update user hook
export function useUpdateUser() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateUser = async (id: string, userData: UpdateUserData) => {
    setIsLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('No authentication token')
      }

      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user')
      }

      // Invalidate both user list and specific user cache
      await Promise.all([
        mutate('/api/users'),
        mutate(`/api/users/${id}`)
      ])

      return data.user
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { updateUser, isLoading, error }
}

// Delete user hook
export function useDeleteUser() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deleteUser = async (id: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('No authentication token')
      }

      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user')
      }

      // Invalidate users cache to refresh list
      await mutate('/api/users')

      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete user'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { deleteUser, isLoading, error }
}

// Utility functions
export const generatePassword = (length = 8): string => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}

export const getRoleBadgeColor = (role: string): string => {
  switch (role) {
    case 'admin':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'manager':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'cashier':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'chef':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export const getRoleLabel = (role: string): string => {
  switch (role) {
    case 'admin':
      return 'Administrator'
    case 'manager':
      return 'Manager'
    case 'cashier':
      return 'Cashier'
    case 'chef':
      return 'Chef'
    default:
      return role
  }
}
