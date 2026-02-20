'use client'

import { useState, useEffect } from 'react'
import { useRestaurants } from './use-restaurants'
import { getCurrency, formatCurrency, Currency } from '@/lib/currencies'

interface UseCurrencyOptions {
  restaurantId?: string
}

export function useCurrency(options: UseCurrencyOptions = {}) {
  const [currency, setCurrency] = useState<Currency | null>(null)
  const [loading, setLoading] = useState(true)
  const { restaurants } = useRestaurants()

  useEffect(() => {
    const loadCurrency = async () => {
      try {
        setLoading(true)
        
        // Determine which restaurant to use
        const targetRestaurantId = options.restaurantId || 
          (restaurants.length > 0 ? restaurants[0].id : null)
        
        if (!targetRestaurantId) {
          console.log('[useCurrency] No restaurant available, using default')
          setCurrency(getCurrency('KES') || null)
          setLoading(false)
          return
        }

        // Fetch settings for the restaurant
        const response = await fetch(`/api/settings?restaurantId=${targetRestaurantId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        })

        if (response.ok) {
          const settings = await response.json()
          const currencyCode = settings.restaurant?.currency || 'KES'
          const currencyData = getCurrency(currencyCode)
          setCurrency(currencyData || getCurrency('KES') || null)
          console.log('[useCurrency] Loaded currency:', currencyCode)
        } else {
          console.log('[useCurrency] Failed to fetch settings, using default')
          setCurrency(getCurrency('KES') || null)
        }
      } catch (error) {
        console.error('[useCurrency] Error loading currency:', error)
        setCurrency(getCurrency('KES') || null)
      } finally {
        setLoading(false)
      }
    }

    loadCurrency()
  }, [options.restaurantId, restaurants])

  const formatAmount = (amount: number, currencyCode?: string) => {
    const targetCurrency = currencyCode ? getCurrency(currencyCode) : currency
    if (!targetCurrency) {
      return formatCurrency(amount, 'KES')
    }
    return formatCurrency(amount, targetCurrency.code)
  }

  const getCurrencySymbol = (currencyCode?: string) => {
    const targetCurrency = currencyCode ? getCurrency(currencyCode) : currency
    return targetCurrency?.symbol || 'KSh'
  }

  const getCurrencyCode = () => {
    return currency?.code || 'KES'
  }

  return {
    currency,
    loading,
    formatAmount,
    getCurrencySymbol,
    getCurrencyCode,
    setCurrency
  }
}
