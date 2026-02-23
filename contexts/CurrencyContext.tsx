'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRestaurants } from '@/hooks/use-restaurants'
import { getCurrency, formatCurrency, Currency } from '@/lib/currencies'

interface CurrencyContextType {
  currency: Currency | null
  loading: boolean
  restaurantId: string | null
  formatAmount: (amount: number, currencyCode?: string) => string
  getCurrencySymbol: (currencyCode?: string) => string
  getCurrencyCode: () => string
  refreshCurrency: (restaurantId?: string) => Promise<void>
  setRestaurantId: (restaurantId: string) => void
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency | null>(null)
  const [loading, setLoading] = useState(true)
  const [restaurantId, setRestaurantId] = useState<string | null>(null)
  const { restaurants } = useRestaurants()

  const loadCurrency = useCallback(async (targetRestaurantId?: string) => {
    try {
      setLoading(true)
      
      // Determine which restaurant to use
      const effectiveRestaurantId = targetRestaurantId || restaurantId || 
        (restaurants.length > 0 ? restaurants[0].id : null)
      
      if (!effectiveRestaurantId) {
        console.log('[CurrencyContext] No restaurant available, using default')
        setCurrency(getCurrency('UGX') || null)
        setLoading(false)
        return
      }

      // Fetch settings for the restaurant
      const response = await fetch(`/api/settings?restaurantId=${effectiveRestaurantId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (response.ok) {
        const settings = await response.json()
        const currencyCode = settings.restaurant?.currency || 'UGX'
        const currencyData = getCurrency(currencyCode)
        setCurrency(currencyData || getCurrency('UGX') || null)
        console.log('[CurrencyContext] Loaded currency:', currencyCode)
      } else {
        console.log('[CurrencyContext] Failed to fetch settings, using default')
        setCurrency(getCurrency('UGX') || null)
      }
    } catch (error) {
      console.error('[CurrencyContext] Error loading currency:', error)
      setCurrency(getCurrency('UGX') || null)
    } finally {
      setLoading(false)
    }
  }, [restaurantId, restaurants])

  // Auto-load currency when restaurantId or restaurants change
  useEffect(() => {
    if (restaurantId || restaurants.length > 0) {
      loadCurrency()
    }
  }, [restaurantId, restaurants, loadCurrency])

  const refreshCurrency = useCallback(async (targetRestaurantId?: string) => {
    console.log('[CurrencyContext] Refreshing currency for restaurant:', targetRestaurantId || restaurantId)
    await loadCurrency(targetRestaurantId)
  }, [loadCurrency, restaurantId])

  const formatAmount = (amount: number, currencyCode?: string) => {
    const targetCurrency = currencyCode ? getCurrency(currencyCode) : currency
    if (!targetCurrency) {
      return formatCurrency(amount, 'UGX')
    }
    return formatCurrency(amount, targetCurrency.code)
  }

  const getCurrencySymbol = (currencyCode?: string) => {
    const targetCurrency = currencyCode ? getCurrency(currencyCode) : currency
    return targetCurrency?.symbol || 'USh'
  }

  const getCurrencyCode = () => {
    return currency?.code || 'UGX'
  }

  const handleSetRestaurantId = (newRestaurantId: string) => {
    console.log('[CurrencyContext] Setting restaurant ID:', newRestaurantId)
    setRestaurantId(newRestaurantId)
  }

  const value: CurrencyContextType = {
    currency,
    loading,
    restaurantId,
    formatAmount,
    getCurrencySymbol,
    getCurrencyCode,
    refreshCurrency,
    setRestaurantId: handleSetRestaurantId
  }

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrencyContext() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrencyContext must be used within a CurrencyProvider')
  }
  return context
}

// Export a hook for backward compatibility
export function useCurrency(options: { restaurantId?: string } = {}) {
  const context = useCurrencyContext()
  
  // If a specific restaurantId is provided, update the context
  useEffect(() => {
    if (options.restaurantId && options.restaurantId !== context.restaurantId) {
      context.setRestaurantId(options.restaurantId)
    }
  }, [options.restaurantId, context.restaurantId, context.setRestaurantId])

  return {
    currency: context.currency,
    loading: context.loading,
    formatAmount: context.formatAmount,
    getCurrencySymbol: context.getCurrencySymbol,
    getCurrencyCode: context.getCurrencyCode
  }
}
