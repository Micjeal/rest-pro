/**
 * Currency Exchange Rate Service
 * Fetches real-time exchange rates and provides conversion functionality
 */

export interface ExchangeRate {
  from: string
  to: string
  rate: number
  timestamp: number
}

export interface ExchangeRates {
  [key: string]: number // e.g., 'USD-KES': 130.5
}

class ExchangeRateService {
  private static instance: ExchangeRateService
  private rates: ExchangeRates = {}
  private lastUpdate: number = 0
  private readonly CACHE_DURATION = 3600000 // 1 hour in milliseconds
  private readonly API_KEY = process.env.EXCHANGE_RATE_API_KEY || 'demo-key'

  static getInstance(): ExchangeRateService {
    if (!ExchangeRateService.instance) {
      ExchangeRateService.instance = new ExchangeRateService()
    }
    return ExchangeRateService.instance
  }

  /**
   * Fetch real-time exchange rates from API
   */
  async fetchExchangeRates(baseCurrency: string = 'USD'): Promise<void> {
    try {
      console.log('[ExchangeRateService] Fetching exchange rates for base:', baseCurrency)
      
      // Using exchangerate-api.com (free tier)
      const response = await fetch(
        `https://v6.exchangerate-api.com/v6/latest/${baseCurrency}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch exchange rates: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.result === 'success') {
        // Store rates relative to base currency
        this.rates = {}
        Object.entries(data.conversion_rates).forEach(([currency, rate]) => {
          this.rates[`${baseCurrency}-${currency}`] = rate as number
        })
        
        this.lastUpdate = Date.now()
        console.log('[ExchangeRateService] Exchange rates updated successfully')
        console.log('[ExchangeRateService] Sample rates:', {
          'USD-KES': this.rates['USD-KES'],
          'USD-UGX': this.rates['USD-UGX'],
          'USD-TZS': this.rates['USD-TZS'],
        })
      } else {
        throw new Error(data['error-type'] || 'Unknown error')
      }
    } catch (error) {
      console.error('[ExchangeRateService] Error fetching exchange rates:', error)
      
      // Fallback to hardcoded rates for East African currencies
      this.setFallbackRates()
    }
  }

  /**
   * Set fallback exchange rates when API fails
   */
  private setFallbackRates(): void {
    console.log('[ExchangeRateService] Using fallback exchange rates')
    
    // Fallback rates (as of recent data)
    const fallbackRates = {
      'USD-KES': 130.5,
      'USD-UGX': 3745.0,
      'USD-TZS': 2330.0,
      'USD-RWF': 1285.0,
      'USD-BIF': 2855.0,
      'USD-SCR': 14.5,
      'USD-MUR': 45.8,
      'USD-SOS': 570.0,
      'USD-DJF': 178.0,
      'USD-ETB': 55.5,
      'USD-ERN': 15.0,
      'USD-SSP': 130.26,
      'USD-ZMW': 21.5,
      'USD-MWK': 1025.0,
      'USD-MZN': 63.8,
      'USD-MGA': 4450.0,
      'USD-CDF': 2750.0,
      'USD-AOA': 850.0,
      'USD-NAD': 18.5,
      'USD-BWP': 13.5,
      'USD-SZL': 18.5,
      'USD-LSL': 18.5,
      'USD-ZAR': 18.5,
      'USD-GHS': 12.5,
      'USD-NGN': 775.0,
      'USD-XAF': 605.0,
      'USD-XOF': 605.0,
      'USD-GMD': 58.5,
      'USD-LRD': 185.0,
      'USD-SLL': 21500.0,
      'USD-GNF': 8750.0,
      'USD-KMF': 460.0,
      'USD-MRU': 38.0,
      'USD-CVE': 102.5,
      
      // Cross rates for East African currencies
      'KES-UGX': 28.7,
      'KES-TZS': 17.8,
      'KES-RWF': 9.8,
      'UGX-KES': 0.035,
      'UGX-TZS': 0.62,
      'UGX-RWF': 0.34,
      'TZS-KES': 0.056,
      'TZS-UGX': 1.61,
      'TZS-RWF': 0.55,
      'RWF-KES': 0.102,
      'RWF-UGX': 2.94,
      'RWF-TZS': 1.82,
    }

    this.rates = fallbackRates
    this.lastUpdate = Date.now()
  }

  /**
   * Get exchange rate between two currencies
   */
  getExchangeRate(from: string, to: string): number {
    const rateKey = `${from}-${to}`
    
    if (this.rates[rateKey]) {
      return this.rates[rateKey]
    }

    // Try reverse rate
    const reverseKey = `${to}-${from}`
    if (this.rates[reverseKey]) {
      return 1 / this.rates[reverseKey]
    }

    // Always try USD as intermediary for better coverage
    const fromToUSD = this.rates[`USD-${from}`]
    const toFromUSD = this.rates[`USD-${to}`]
    
    if (fromToUSD && toFromUSD) {
      return toFromUSD / fromToUSD
    }

    // If one of the currencies is USD, use direct rate
    if (from === 'USD' && this.rates[`USD-${to}`]) {
      return this.rates[`USD-${to}`]
    }
    
    if (to === 'USD' && this.rates[`${from}-USD`]) {
      return this.rates[`${from}-USD`]
    }

    console.warn(`[ExchangeRateService] No exchange rate found for ${from} to ${to}`)
    return 1.0 // Fallback to 1:1
  }

  /**
   * Convert amount from one currency to another
   */
  convertAmount(amount: number, from: string, to: string): number {
    if (from === to) {
      return amount
    }

    const rate = this.getExchangeRate(from, to)
    return amount * rate
  }

  /**
   * Check if rates need updating
   */
  needsUpdate(): boolean {
    return Date.now() - this.lastUpdate > this.CACHE_DURATION
  }

  /**
   * Get cached rates or fetch new ones if needed
   */
  async getRates(baseCurrency: string = 'USD'): Promise<ExchangeRates> {
    if (this.needsUpdate() || Object.keys(this.rates).length === 0) {
      await this.fetchExchangeRates(baseCurrency)
    }
    return this.rates
  }

  /**
   * Get last update timestamp
   */
  getLastUpdate(): number {
    return this.lastUpdate
  }

  /**
   * Force refresh exchange rates
   */
  async refreshRates(baseCurrency: string = 'USD'): Promise<void> {
    await this.fetchExchangeRates(baseCurrency)
  }
}

export const exchangeRateService = ExchangeRateService.getInstance()
