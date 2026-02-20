/**
 * Settings API Route
 * GET /api/settings - Get settings for a restaurant
 * PUT /api/settings - Update settings for a restaurant
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Service role client to bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const serviceClient = supabaseUrl && supabaseServiceKey 
  ? createSupabaseClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')

    // Get user from auth header (simplified)
    const authHeader = request.headers.get('authorization')
    let userId = null

    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7)
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
        userId = decoded.userId
        console.log('[Settings API] User ID from token:', userId)
      } catch (error) {
        console.error('[Settings API] Invalid token format:', error)
      }
    }

    if (!userId) {
      console.log('[Settings API] No user ID found, returning 401')
      return NextResponse.json({ error: 'Unauthorized - No valid token' }, { status: 401 })
    }

    if (!restaurantId) {
      return NextResponse.json({ error: 'Restaurant ID is required' }, { status: 400 })
    }

    console.log('[Settings API] Fetching settings for restaurant:', restaurantId, 'user:', userId)

    // Verify user owns the restaurant
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id')
      .eq('id', restaurantId)
      .eq('owner_id', userId)
      .single()

    if (restaurantError || !restaurant) {
      console.log('[Settings API] Restaurant not found or access denied')
      return NextResponse.json({ error: 'Restaurant not found or access denied' }, { status: 404 })
    }

    // Get settings for the restaurant - use service client to bypass RLS
    const client = serviceClient || supabase
    const { data: settings, error } = await client
      .from('restaurant_settings')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('[Settings API] Error fetching settings:', error)
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
    }

    // Return default settings if none exist
    if (!settings) {
      const defaultSettings = {
        restaurant_id: restaurantId,
        restaurant: {
          name: '',
          address: '',
          phone: '',
          email: '',
          taxRate: 8.5,
          currency: 'KES', // Default to Kenyan Shilling for East Africa
        },
        pos: {
          receiptHeader: 'Thank you for dining with us!',
          receiptFooter: 'Please come again!',
          autoPrintReceipts: false,
          showTaxBreakdown: true,
          allowDiscounts: true,
          maxDiscountPercent: 25,
        },
        system: {
          backupEnabled: true,
          backupFrequency: 'daily',
          notificationEmail: '',
          maintenanceMode: false,
          debugMode: false,
        },
        security: {
          sessionTimeout: 30,
          requirePasswordForRefunds: true,
          requirePasswordForDiscounts: true,
          allowStaffLogin: true,
        }
      }
      return NextResponse.json(defaultSettings)
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('[Settings API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { restaurantId, ...settingsData } = body

    // Get user from auth header (simplified)
    const authHeader = request.headers.get('authorization')
    let userId = null

    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7)
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
        userId = decoded.userId
        console.log('[Settings API] User ID from token:', userId)
      } catch (error) {
        console.error('[Settings API] Invalid token format:', error)
      }
    }

    if (!userId) {
      console.log('[Settings API] No user ID found, returning 401')
      return NextResponse.json({ error: 'Unauthorized - No valid token' }, { status: 401 })
    }

    if (!restaurantId) {
      return NextResponse.json({ error: 'Restaurant ID is required' }, { status: 400 })
    }

    console.log('[Settings API] Updating settings for restaurant:', restaurantId, 'user:', userId)

    // Verify user owns the restaurant
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id')
      .eq('id', restaurantId)
      .eq('owner_id', userId)
      .single()

    if (restaurantError || !restaurant) {
      console.log('[Settings API] Restaurant not found or access denied')
      return NextResponse.json({ error: 'Restaurant not found or access denied' }, { status: 404 })
    }

    // Upsert settings - use service client to bypass RLS
    const client = serviceClient || supabase
    const { data: settings, error } = await client
      .from('restaurant_settings')
      .upsert({
        restaurant_id: restaurantId,
        ...settingsData,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'restaurant_id'
      })
      .select()
      .single()

    if (error) {
      console.error('[Settings API] Error updating settings:', error)
      return NextResponse.json({ error: error.message || 'Failed to update settings' }, { status: 500 })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('[Settings API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
