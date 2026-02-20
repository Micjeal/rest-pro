/**
 * @fileoverview Staff Hook
 * Custom hook for fetching staff users for assignment purposes
 */

import useSWR from 'swr'
import { useState } from 'react'

// Types
export interface StaffUser {
  id: string
  email: string
  name: string
  role: string
  created_at: string
  updated_at: string
}

export interface StaffResponse {
  users: StaffUser[]
  total: number
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
    throw new Error(error.error || 'Failed to fetch staff data')
  }

  return response.json()
}

// Main staff hook
export function useStaff(search = '') {
  const params = new URLSearchParams({
    ...(search && { search })
  })

  const { data, error, isLoading, mutate } = useSWR<StaffResponse>(
    `/api/staff?${params}`,
    fetcher
  )

  return {
    staff: data?.users || [],
    total: data?.total || 0,
    isLoading,
    error,
    mutate
  }
}
