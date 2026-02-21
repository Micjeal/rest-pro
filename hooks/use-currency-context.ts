'use client'

import { useCurrencyContext as useCurrencyContextValue } from '@/contexts/CurrencyContext'

/**
 * Hook for accessing the global currency context
 * This provides access to currency state and refresh functionality
 */
export function useCurrencyContext() {
  return useCurrencyContextValue()
}

/**
 * Hook for currency refresh functionality
 * Allows manual triggering of currency updates
 */
export function useCurrencyRefresh() {
  const { refreshCurrency, restaurantId } = useCurrencyContextValue()
  
  const refresh = async (targetRestaurantId?: string) => {
    await refreshCurrency(targetRestaurantId || restaurantId || undefined)
  }
  
  return { refresh }
}

/**
 * Hook for currency change events
 * Provides utilities for listening to and triggering currency changes
 */
export function useCurrencyEvents() {
  const { currency, loading, restaurantId } = useCurrencyContextValue()
  
  const triggerCurrencyUpdate = async () => {
    // Trigger a global currency refresh event
    window.dispatchEvent(new CustomEvent('currencyChanged', {
      detail: { 
        currency, 
        restaurantId,
        timestamp: Date.now()
      }
    }))
  }
  
  const listenForCurrencyChanges = (callback: (event: CustomEvent) => void) => {
    window.addEventListener('currencyChanged', callback as EventListener)
    
    // Return cleanup function
    return () => {
      window.removeEventListener('currencyChanged', callback as EventListener)
    }
  }
  
  return {
    currency,
    loading,
    restaurantId,
    triggerCurrencyUpdate,
    listenForCurrencyChanges
  }
}
