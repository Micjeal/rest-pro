'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

interface ReportsData {
  dailyData: any[]
  categoryData: any[]
  hourlyData: any[]
  weeklyData: any[]
  paymentData: any[]
  statusData: any[]
  totalOrders: number
  totalRevenue: number
  averageTransaction: number
}

interface UseReportsDataOptions {
  restaurantId: string | null
  dateRange: string
  startDate?: string
  endDate?: string
  enabled?: boolean
}

// Simple cache implementation
const cache = new Map<string, { data: ReportsData; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function useReportsData({
  restaurantId,
  dateRange,
  startDate,
  endDate,
  enabled = true
}: UseReportsDataOptions) {
  const [data, setData] = useState<ReportsData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Generate cache key
  const cacheKey = useMemo(() => {
    return `${restaurantId}-${dateRange}-${startDate || ''}-${endDate || ''}`
  }, [restaurantId, dateRange, startDate, endDate])

  // Check cache first
  const getCachedData = useCallback(() => {
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data
    }
    return null
  }, [cacheKey])

  // Set cache data
  const setCachedData = useCallback((newData: ReportsData) => {
    cache.set(cacheKey, {
      data: newData,
      timestamp: Date.now()
    })
  }, [cacheKey])

  // Fetch data from API
  const fetchData = useCallback(async () => {
    if (!restaurantId || !enabled) return

    // Check cache first
    const cachedData = getCachedData()
    if (cachedData) {
      setData(cachedData)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Build date range parameters
      let dateParams = ''
      if (dateRange === 'custom' && startDate && endDate) {
        dateParams = `&startDate=${startDate}&endDate=${endDate}`
      } else if (dateRange !== 'custom') {
        dateParams = `&range=${dateRange}`
      }

      const response = await fetch(`/api/analytics?restaurantId=${restaurantId}${dateParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Cache-Control': 'max-age=300'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch analytics data')
      }

      const analyticsData = await response.json()
      
      // Process and cache the data
      const processedData: ReportsData = {
        dailyData: analyticsData.dailyData || [],
        categoryData: analyticsData.categoryData || [],
        hourlyData: analyticsData.hourlyData || [],
        weeklyData: analyticsData.weeklyData || [],
        paymentData: analyticsData.paymentData || [],
        statusData: analyticsData.statusData || [],
        totalOrders: analyticsData.totalOrders || 0,
        totalRevenue: analyticsData.totalRevenue || 0,
        averageTransaction: analyticsData.averageTransaction || 0
      }

      setCachedData(processedData)
      setData(processedData)
    } catch (err) {
      console.error('[Reports Hook] Error fetching data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }, [restaurantId, dateRange, startDate, endDate, enabled, getCachedData, setCachedData])

  // Auto-fetch when dependencies change
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Manual refresh function
  const refresh = useCallback(() => {
    // Clear cache for this key
    cache.delete(cacheKey)
    fetchData()
  }, [cacheKey, fetchData])

  // Memoized processed metrics
  const metrics = useMemo(() => {
    if (!data) return {
      totalRevenue: 0,
      totalOrders: 0,
      totalTransactions: 0,
      averageTransaction: 0
    }

    const totalRevenue = data.dailyData.reduce((sum, day) => {
      const sales = typeof day?.sales === 'number' && !isNaN(day.sales) ? day.sales : 0
      return sum + sales
    }, 0)
    
    const totalTransactions = data.dailyData.reduce((sum, day) => {
      const transactions = typeof day?.transactions === 'number' && !isNaN(day.transactions) ? day.transactions : 0
      return sum + transactions
    }, 0)
    
    const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0

    return {
      totalRevenue,
      totalOrders: data.totalOrders || totalTransactions,
      totalTransactions,
      averageTransaction
    }
  }, [data])

  return {
    data,
    isLoading,
    error,
    refresh,
    metrics,
    cacheKey
  }
}
