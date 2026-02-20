/**
 * Currency Conversion Utilities
 * Handles automatic price conversion when currency changes
 */

import { exchangeRateService } from './exchange-rates'
import { getCurrency } from './currencies'

export interface ConvertiblePrice {
  id: string
  originalAmount: number
  originalCurrency: string
  convertedAmount?: number
  convertedCurrency?: string
}

export interface ConversionResult {
  success: boolean
  message: string
  convertedCount?: number
  failedCount?: number
}

/**
 * Convert prices for menu items, inventory, and other products
 */
export class CurrencyConverter {
  /**
   * Convert menu items prices to new currency
   */
  static async convertMenuItems(
    items: any[], 
    fromCurrency: string, 
    toCurrency: string
  ): Promise<{ items: any[], conversionResult: ConversionResult }> {
    try {
      console.log(`[CurrencyConverter] Converting ${items.length} menu items from ${fromCurrency} to ${toCurrency}`)
      
      const rates = await exchangeRateService.getRates()
      let convertedCount = 0
      let failedCount = 0
      
      const convertedItems = items.map(item => {
        try {
          const convertedPrice = exchangeRateService.convertAmount(
            item.price, 
            fromCurrency, 
            toCurrency
          )
          
          convertedCount++
          
          return {
            ...item,
            originalPrice: item.price,
            originalCurrency: fromCurrency,
            price: this.roundToCurrencyPrecision(convertedPrice, toCurrency),
            convertedAt: new Date().toISOString(),
            exchangeRate: exchangeRateService.getExchangeRate(fromCurrency, toCurrency)
          }
        } catch (error) {
          console.error(`[CurrencyConverter] Failed to convert item ${item.id}:`, error)
          failedCount++
          return item // Return original item if conversion fails
        }
      })
      
      return {
        items: convertedItems,
        conversionResult: {
          success: failedCount === 0,
          message: `Converted ${convertedCount} items${failedCount > 0 ? ` (${failedCount} failed)` : ''}`,
          convertedCount,
          failedCount
        }
      }
    } catch (error) {
      console.error('[CurrencyConverter] Menu item conversion failed:', error)
      return {
        items,
        conversionResult: {
          success: false,
          message: `Conversion failed: ${error}`,
          convertedCount: 0,
          failedCount: items.length
        }
      }
    }
  }

  /**
   * Convert inventory items prices to new currency
   */
  static async convertInventoryItems(
    items: any[], 
    fromCurrency: string, 
    toCurrency: string
  ): Promise<{ items: any[], conversionResult: ConversionResult }> {
    try {
      console.log(`[CurrencyConverter] Converting ${items.length} inventory items from ${fromCurrency} to ${toCurrency}`)
      
      let convertedCount = 0
      let failedCount = 0
      
      const convertedItems = items.map(item => {
        try {
          const convertedCost = exchangeRateService.convertAmount(
            item.cost || item.unit_cost || 0, 
            fromCurrency, 
            toCurrency
          )
          
          const convertedPrice = exchangeRateService.convertAmount(
            item.price || item.selling_price || 0, 
            fromCurrency, 
            toCurrency
          )
          
          convertedCount++
          
          return {
            ...item,
            originalCost: item.cost || item.unit_cost,
            originalPrice: item.price || item.selling_price,
            originalCurrency: fromCurrency,
            cost: this.roundToCurrencyPrecision(convertedCost, toCurrency),
            price: this.roundToCurrencyPrecision(convertedPrice, toCurrency),
            convertedAt: new Date().toISOString(),
            exchangeRate: exchangeRateService.getExchangeRate(fromCurrency, toCurrency)
          }
        } catch (error) {
          console.error(`[CurrencyConverter] Failed to convert inventory item ${item.id}:`, error)
          failedCount++
          return item
        }
      })
      
      return {
        items: convertedItems,
        conversionResult: {
          success: failedCount === 0,
          message: `Converted ${convertedCount} items${failedCount > 0 ? ` (${failedCount} failed)` : ''}`,
          convertedCount,
          failedCount
        }
      }
    } catch (error) {
      console.error('[CurrencyConverter] Inventory item conversion failed:', error)
      return {
        items,
        conversionResult: {
          success: false,
          message: `Conversion failed: ${error}`,
          convertedCount: 0,
          failedCount: items.length
        }
      }
    }
  }

  /**
   * Round amount to appropriate decimal places for currency
   */
  static roundToCurrencyPrecision(amount: number, currencyCode: string): number {
    const currency = getCurrency(currencyCode)
    if (!currency) {
      return Math.round(amount * 100) / 100 // Default to 2 decimal places
    }
    
    const factor = Math.pow(10, currency.decimalDigits)
    return Math.round(amount * factor) / factor
  }

  /**
   * Convert a single amount
   */
  static async convertAmount(
    amount: number, 
    from: string, 
    to: string
  ): Promise<number> {
    await exchangeRateService.getRates()
    const convertedAmount = exchangeRateService.convertAmount(amount, from, to)
    return this.roundToCurrencyPrecision(convertedAmount, to)
  }

  /**
   * Get current exchange rate between two currencies
   */
  static async getExchangeRate(from: string, to: string): Promise<number> {
    await exchangeRateService.getRates()
    return exchangeRateService.getExchangeRate(from, to)
  }

  /**
   * Format conversion result for display
   */
  static formatConversionResult(result: ConversionResult): string {
    if (result.success) {
      return `✅ ${result.message}`
    } else {
      return `❌ ${result.message}`
    }
  }
}
