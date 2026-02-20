/**
 * @fileoverview Setup Sample Menus API Route
 * Creates sample menus for existing restaurants
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    console.log('[Setup] Creating sample menus for existing restaurants...')

    // Get all restaurants
    const { data: restaurants, error: fetchError } = await supabase
      .from('restaurants')
      .select('id, name')
    
    if (fetchError) {
      console.error('[Setup] Error fetching restaurants:', fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!restaurants || restaurants.length === 0) {
      return NextResponse.json({ error: 'No restaurants found' }, { status: 404 })
    }

    // Create sample menus for each restaurant
    const menuPromises = restaurants.map(async (restaurant) => {
      // Create lunch menu
      const { data: lunchMenu, error: lunchError } = await supabase
        .from('menus')
        .insert({
          restaurant_id: restaurant.id,
          name: 'Lunch Menu',
          description: 'Fresh and healthy lunch options available from 11am to 3pm'
        })
        .select()
        .single()

      // Create dinner menu
      const { data: dinnerMenu, error: dinnerError } = await supabase
        .from('menus')
        .insert({
          restaurant_id: restaurant.id,
          name: 'Dinner Menu', 
          description: 'Elegant dinner selections available from 5pm to 10pm'
        })
        .select()
        .single()

      return {
        restaurantId: restaurant.id,
        lunchMenu: lunchMenu,
        dinnerMenu: dinnerMenu,
        lunchError,
        dinnerError
      }
    })

    const results = await Promise.all(menuPromises)
    
    // Count successful menu creations
    const successCount = results.filter(r => !r.lunchError && !r.dinnerError).length
    const errorCount = results.length - successCount

    console.log(`[Setup] Created menus for ${successCount} restaurants, ${errorCount} errors`)

    return NextResponse.json({
      message: `Sample menus created for ${successCount} restaurants`,
      successCount,
      errorCount,
      results: results.map(r => ({
        restaurantId: r.restaurantId,
        restaurantName: restaurants.find(rest => rest.id === r.restaurantId)?.name || 'Unknown',
        lunchMenu: r.lunchMenu,
        dinnerMenu: r.dinnerMenu
      }))
    })

  } catch (error) {
    console.error('[Setup] Unexpected error:', error)
    return NextResponse.json({ error: 'Failed to setup sample menus' }, { status: 500 })
  }
}
