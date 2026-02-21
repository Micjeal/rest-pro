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
  async fetchExchangeRates(baseCurrency: string = 'UGX'): Promise<void> {
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
    
    // Fallback rates (as of recent data) - UGX as base
    const fallbackRates = {
      // UGX to other currencies (inverted from USD-based rates)
      'UGX-USD': 0.000267,
      'UGX-KES': 0.0348,
      'UGX-TZS': 0.622,
      'UGX-RWF': 0.343,
      'UGX-BIF': 0.762,
      'UGX-SCR': 0.00387,
      'UGX-MUR': 0.0122,
      'UGX-SOS': 0.152,
      'UGX-DJF': 0.0475,
      'UGX-ETB': 0.0148,
      'UGX-ERN': 0.00400,
      'UGX-SSP': 0.0348,
      'UGX-ZMW': 0.00574,
      'UGX-MWK': 0.274,
      'UGX-MZN': 0.0170,
      'UGX-MGA': 1.19,
      'UGX-CDF': 0.734,
      'UGX-AOA': 0.227,
      'UGX-NAD': 0.00494,
      'UGX-BWP': 0.00360,
      'UGX-SZL': 0.00494,
      'UGX-LSL': 0.00494,
      'UGX-ZAR': 0.00494,
      'UGX-GHS': 0.00334,
      'UGX-NGN': 0.207,
      'UGX-XAF': 0.162,
      'UGX-XOF': 0.162,
      'UGX-GMD': 0.0156,
      'UGX-LRD': 0.0494,
      'UGX-SLL': 5.74,
      'UGX-GNF': 2.34,
      'UGX-KMF': 0.123,
      'UGX-MRU': 0.0101,
      'UGX-CVE': 0.0274,
      
      // Cross rates for East African currencies
      'KES-UGX': 28.7,
      'KES-TZS': 17.8,
      'KES-RWF': 9.8,
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

    // Always try UGX as intermediary for better coverage
    const fromToUGX = this.rates[`UGX-${from}`]
    const toFromUGX = this.rates[`UGX-${to}`]
    
    if (fromToUGX && toFromUGX) {
      return toFromUGX / fromToUGX
    }

    // If one of the currencies is UGX, use direct rate
    if (from === 'UGX' && this.rates[`UGX-${to}`]) {
      return this.rates[`UGX-${to}`]
    }
    
    if (to === 'UGX' && this.rates[`${from}-UGX`]) {
      return this.rates[`${from}-UGX`]
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
  async getRates(baseCurrency: string = 'UGX'): Promise<ExchangeRates> {
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
  async refreshRates(baseCurrency: string = 'UGX'): Promise<void> {
    await this.fetchExchangeRates(baseCurrency)
  }
}

export const exchangeRateService = ExchangeRateService.getInstance()
