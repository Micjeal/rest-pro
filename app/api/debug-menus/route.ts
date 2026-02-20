/**
 * @fileoverview Debug Menus API Route
 * Checks menu data for debugging
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get all restaurants with their menus
    const { data: restaurants, error } = await supabase
      .from('restaurants')
      .select(`
        id,
        name,
        menus (
          id,
          name,
          description,
          created_at
        )
      `)
    
    if (error) {
      console.error('[Debug] Error fetching restaurants:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    console.log('[Debug] Restaurants with menus:', restaurants?.length || 0)
    
    const restaurantDetails = restaurants?.map(restaurant => ({
      restaurantName: restaurant.name,
      restaurantId: restaurant.id,
      menuCount: restaurant.menus?.length || 0,
      menus: restaurant.menus?.map(menu => ({
        id: menu.id,
        name: menu.name,
        description: menu.description,
        itemCount: 0 // Will be calculated when menu_items is joined
      })) || []
    }))
    
    return NextResponse.json({
      message: 'Menu debug data',
      restaurants: restaurantDetails
    })

  } catch (error) {
    console.error('[Debug] Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
