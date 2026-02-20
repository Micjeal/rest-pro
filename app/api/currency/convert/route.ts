/**
 * Currency Conversion API Route
 * POST /api/currency/convert - Convert prices when currency changes
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CurrencyConverter } from '@/lib/currency-converter'
import { exchangeRateService } from '@/lib/exchange-rates'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { restaurantId, fromCurrency, toCurrency, conversionType } = body

    // Validate input
    if (!restaurantId || !fromCurrency || !toCurrency) {
      return NextResponse.json(
        { error: 'Missing required fields: restaurantId, fromCurrency, toCurrency' },
        { status: 400 }
      )
    }

    if (fromCurrency === toCurrency) {
      return NextResponse.json(
        { error: 'Source and target currencies are the same' },
        { status: 400 }
      )
    }

    // Get user from auth header
    const authHeader = request.headers.get('authorization')
    let userId = null

    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7)
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
        userId = decoded.userId
      } catch (error) {
        console.error('[Currency API] Invalid token format:', error)
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user owns the restaurant
    const supabase = await createClient()
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id')
      .eq('id', restaurantId)
      .eq('owner_id', userId)
      .single()

    if (restaurantError || !restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found or access denied' },
        { status: 404 }
      )
    }

    console.log(`[Currency API] Converting from ${fromCurrency} to ${toCurrency} for restaurant ${restaurantId}`)

    // Refresh exchange rates
    await exchangeRateService.refreshRates()

    const results = {
      menuItems: { success: false, convertedCount: 0, failedCount: 0 },
      inventoryItems: { success: false, convertedCount: 0, failedCount: 0 }
    }

    // Convert menu items if requested
    if (!conversionType || conversionType === 'menu' || conversionType === 'all') {
      try {
        const { data: menuItems } = await supabase
          .from('menu_items')
          .select('*')
          .eq('restaurant_id', restaurantId)

        if (menuItems && menuItems.length > 0) {
          const { items: convertedItems, conversionResult } = await CurrencyConverter.convertMenuItems(
            menuItems,
            fromCurrency,
            toCurrency
          )

          // Update menu items in database
          const { error: updateError } = await supabase
            .from('menu_items')
            .upsert(convertedItems)

          if (!updateError) {
            results.menuItems = {
              success: conversionResult.success,
              convertedCount: conversionResult.convertedCount || 0,
              failedCount: conversionResult.failedCount || 0
            }
            console.log(`[Currency API] Converted ${conversionResult.convertedCount} menu items`)
          } else {
            console.error('[Currency API] Failed to update menu items:', updateError)
          }
        }
      } catch (error) {
        console.error('[Currency API] Menu item conversion failed:', error)
      }
    }

    // Convert inventory items if requested
    if (!conversionType || conversionType === 'inventory' || conversionType === 'all') {
      try {
        const { data: inventoryItems } = await supabase
          .from('inventory')
          .select('*')
          .eq('restaurant_id', restaurantId)

        if (inventoryItems && inventoryItems.length > 0) {
          const { items: convertedItems, conversionResult } = await CurrencyConverter.convertInventoryItems(
            inventoryItems,
            fromCurrency,
            toCurrency
          )

          // Update inventory items in database
          const { error: updateError } = await supabase
            .from('inventory')
            .upsert(convertedItems)

          if (!updateError) {
            results.inventoryItems = {
              success: conversionResult.success,
              convertedCount: conversionResult.convertedCount || 0,
              failedCount: conversionResult.failedCount || 0
            }
            console.log(`[Currency API] Converted ${conversionResult.convertedCount} inventory items`)
          } else {
            console.error('[Currency API] Failed to update inventory items:', updateError)
          }
        }
      } catch (error) {
        console.error('[Currency API] Inventory item conversion failed:', error)
      }
    }

    // Update restaurant settings with new currency
    const { error: settingsError } = await supabase
      .from('restaurant_settings')
      .update({
        restaurant: {
          currency: toCurrency,
          lastCurrencyConversion: {
            from: fromCurrency,
            to: toCurrency,
            at: new Date().toISOString(),
            exchangeRate: exchangeRateService.getExchangeRate(fromCurrency, toCurrency)
          }
        },
        updated_at: new Date().toISOString()
      })
      .eq('restaurant_id', restaurantId)

    if (settingsError) {
      console.error('[Currency API] Failed to update settings:', settingsError)
    }

    const totalConverted = results.menuItems.convertedCount + results.inventoryItems.convertedCount
    const totalFailed = results.menuItems.failedCount + results.inventoryItems.failedCount

    return NextResponse.json({
      success: true,
      message: `Currency conversion completed. ${totalConverted} items converted, ${totalFailed} failed.`,
      results,
      exchangeRate: exchangeRateService.getExchangeRate(fromCurrency, toCurrency),
      conversionTimestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Currency API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const amount = searchParams.get('amount')

    if (!from || !to) {
      return NextResponse.json(
        { error: 'Missing required parameters: from, to' },
        { status: 400 }
      )
    }

    await exchangeRateService.getRates()
    
    let response: any = {
      exchangeRate: exchangeRateService.getExchangeRate(from, to),
      lastUpdate: exchangeRateService.getLastUpdate()
    }

    if (amount) {
      const convertedAmount = exchangeRateService.convertAmount(parseFloat(amount), from, to)
      response = {
        ...response,
        amount: parseFloat(amount),
        convertedAmount,
        from,
        to
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('[Currency API] GET error:', error)
    return NextResponse.json(
      { error: 'Failed to get exchange rate' },
      { status: 500 }
    )
  }
}
