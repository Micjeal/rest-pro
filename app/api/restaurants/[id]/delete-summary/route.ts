/**
 * @fileoverview Restaurant Delete Summary API Route
 * Provides summary of what will be deleted when deleting a restaurant
 * 
 * Dynamic Route: /api/restaurants/[id]/delete-summary
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

/**
 * GET /api/restaurants/[id]/delete-summary
 * Retrieves summary of all data that will be deleted with a restaurant
 * 
 * @param request - NextJS request
 * @returns Deletion summary object or error
 * 
 * Success Response (200):
 * {
 *   restaurant_name: "Test Restaurant",
 *   menus_count: 5,
 *   menu_items_count: 25,
 *   orders_count: 12,
 *   order_items_count: 30,
 *   reservations_count: 8,
 *   inventory_items_count: 15
 * }
 * 
 * Error Responses:
 * - 400: Invalid restaurant ID
 * - 404: Restaurant not found
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id: restaurantId } = await params

  try {
    // Authentication check
    const authHeader = request.headers.get('authorization')
    let userId = null
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7)
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
        userId = decoded.userId
      } catch (error) {
        console.error('[API] Invalid token format')
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Use service client to bypass RLS for this operation
    const client = serviceClient || supabase
    
    console.log('[API Delete Summary] Fetching summary for restaurant:', restaurantId)
    
    const { data: restaurant, error: restaurantError } = await client
      .from('restaurants')
      .select('name')
      .eq('id', restaurantId)
      .single()

    if (restaurantError || !restaurant) {
      console.error('[API Delete Summary] Restaurant not found:', restaurantError)
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    // Count all related data - use service client to bypass RLS
    // First get the related IDs for joins
    const { data: menuIds } = await client
      .from('menus')
      .select('id')
      .eq('restaurant_id', restaurantId)
    
    const { data: orderIds } = await client
      .from('orders')
      .select('id')
      .eq('restaurant_id', restaurantId)

    console.log('[API Delete Summary] Found menu IDs:', menuIds?.length || 0)
    console.log('[API Delete Summary] Found order IDs:', orderIds?.length || 0)

    const [
      { data: menus, error: menusError },
      { data: menuItems, error: menuItemsError },
      { data: orders, error: ordersError },
      { data: orderItems, error: orderItemsError },
      { data: reservations, error: reservationsError },
      { data: inventory, error: inventoryError }
    ] = await Promise.all([
      client.from('menus').select('id', { count: 'exact' }).eq('restaurant_id', restaurantId),
      client
        .from('menu_items')
        .select('id', { count: 'exact' })
        .in('menu_id', menuIds?.map(m => m.id) || []),
      client.from('orders').select('id', { count: 'exact' }).eq('restaurant_id', restaurantId),
      client
        .from('order_items')
        .select('id', { count: 'exact' })
        .in('order_id', orderIds?.map(o => o.id) || []),
      client.from('reservations').select('id', { count: 'exact' }).eq('restaurant_id', restaurantId),
      client.from('inventory').select('id', { count: 'exact' }).eq('restaurant_id', restaurantId)
    ])

    // Check for any errors
    const errors = [restaurantError, menusError, menuItemsError, ordersError, orderItemsError, reservationsError, inventoryError]
    if (errors.some(err => err)) {
      console.error('[API] Delete summary error:', errors)
      return NextResponse.json({ error: 'Failed to fetch deletion summary' }, { status: 500 })
    }

    const summary = {
      restaurant_name: restaurant.name,
      menus_count: menus?.length || 0,
      menu_items_count: menuItems?.length || 0,
      orders_count: orders?.length || 0,
      order_items_count: orderItems?.length || 0,
      reservations_count: reservations?.length || 0,
      inventory_items_count: inventory?.length || 0
    }

    return NextResponse.json(summary)
  } catch (error) {
    console.error('[API] Delete summary unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/restaurants/[id]
 * Deletes a restaurant and all associated data with cascading deletes
 * 
 * @param params - Route parameters with restaurant ID
 * @returns Summary of what was deleted (200) or error
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: restaurantId } = await params

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'Restaurant ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get user ID from auth token (simplified for demo)
    const authHeader = request.headers.get('authorization')
    let userId = null
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7)
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
        userId = decoded.userId
      } catch (error) {
        console.error('[API] Invalid token format')
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Use service client to bypass RLS for this operation
    const client = serviceClient || supabase
    let deletedCounts = {
      restaurant: 0,
      menus: 0,
      menu_items: 0,
      orders: 0,
      order_items: 0,
      reservations: 0,
      inventory_items: 0
    }
    
    try {
      // Delete order items first
      const { data: orderIds } = await client
        .from('orders')
        .select('id')
        .eq('restaurant_id', restaurantId)
      
      if (orderIds && orderIds.length > 0) {
        const { count } = await client
          .from('order_items')
          .delete()
          .in('order_id', orderIds.map(o => o.id))
        deletedCounts.order_items = count || 0
      }
      
      // Delete orders
      const { count: ordersCount } = await client
        .from('orders')
        .delete()
        .eq('restaurant_id', restaurantId)
      deletedCounts.orders = ordersCount || 0
      
      // Delete menu items first
      const { data: menuIds } = await client
        .from('menus')
        .select('id')
        .eq('restaurant_id', restaurantId)
      
      if (menuIds && menuIds.length > 0) {
        const { count } = await client
          .from('menu_items')
          .delete()
          .in('menu_id', menuIds.map(m => m.id))
        deletedCounts.menu_items = count || 0
      }
      
      // Delete menus
      const { count: menusCount } = await client
        .from('menus')
        .delete()
        .eq('restaurant_id', restaurantId)
      deletedCounts.menus = menusCount || 0
      
      // Delete reservations
      const { count: reservationsCount } = await client
        .from('reservations')
        .delete()
        .eq('restaurant_id', restaurantId)
      deletedCounts.reservations = reservationsCount || 0
      
      // Delete inventory items
      const { count: inventoryCount } = await client
        .from('inventory')
        .delete()
        .eq('restaurant_id', restaurantId)
      deletedCounts.inventory_items = inventoryCount || 0
      
      // Finally delete the restaurant
      const { count: restaurantCount } = await client
        .from('restaurants')
        .delete()
        .eq('id', restaurantId)
      deletedCounts.restaurant = restaurantCount || 0
      
    } catch (deleteError) {
      console.error('[API] Error during cascading delete:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete restaurant data' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Restaurant and all associated data deleted successfully',
      deleted: deletedCounts
    })

  } catch (error) {
    console.error('[API] Restaurant deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
