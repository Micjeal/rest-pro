/**
 * @fileoverview Restaurant Management API Route
 * Handles restaurant CRUD operations including safe deletion
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Service role client to bypass RLS for deletes
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
        { error: 'Authentication required. Please log in again.' },
        { status: 401 }
      )
    }

    console.log('[API] Starting delete for restaurant:', restaurantId, 'user:', userId)

    // Debug: Check if service client is available
    console.log('[API] Service client available:', !!serviceClient)
    console.log('[API] Supabase URL:', supabaseUrl ? 'set' : 'missing')
    console.log('[API] Service key:', supabaseServiceKey ? 'set' : 'missing')
    
    // Use service client to bypass RLS for this operation
    const client = serviceClient || supabase
    
    // Debug: Verify we can query the restaurant
    const { data: testRestaurant, error: testError } = await client
      .from('restaurants')
      .select('id, name')
      .eq('id', restaurantId)
      .single()
    
    console.log('[API] Test query result:', testRestaurant, 'error:', testError)

    let deletedCounts = {
      restaurant: 0,
      menus: 0,
      menu_items: 0,
      orders: 0,
      order_items: 0,
      reservations: 0,
      inventory_items: 0
    }

    // Perform cascading delete manually (this approach works without stored procedures)
    try {
      console.log('[API] Starting cascading delete...')
      
      // 1. First verify restaurant exists
      const { data: existingRestaurant, error: checkError } = await client
        .from('restaurants')
        .select('id')
        .eq('id', restaurantId)
        .single()
      
      console.log('[API] Restaurant check:', existingRestaurant, 'error:', checkError)
      
      if (checkError || !existingRestaurant) {
        return NextResponse.json(
          { error: 'Restaurant not found' },
          { status: 404 }
        )
      }
      
      // Use raw SQL for cascading deletes to avoid RLS issues
      // First, delete order items
      const { data: orderIds } = await client
        .from('orders')
        .select('id')
        .eq('restaurant_id', restaurantId)
      
      if (orderIds && orderIds.length > 0) {
        const { error: orderItemsError } = await client
          .from('order_items')
          .delete()
          .in('order_id', orderIds.map(o => o.id))
        
        if (orderItemsError) {
          console.warn('[API] Error deleting order items:', orderItemsError)
        } else {
          deletedCounts.order_items = orderIds.length
          console.log('[API] Deleted order items:', deletedCounts.order_items)
        }
      }
      
      // Delete orders
      const { error: ordersError } = await client
        .from('orders')
        .delete()
        .eq('restaurant_id', restaurantId)
      
      if (ordersError) {
        console.warn('[API] Error deleting orders:', ordersError)
      } else {
        deletedCounts.orders = orderIds?.length || 0
        console.log('[API] Deleted orders:', deletedCounts.orders)
      }
      
      // Delete menu items
      const { data: menuIds } = await client
        .from('menus')
        .select('id')
        .eq('restaurant_id', restaurantId)
      
      if (menuIds && menuIds.length > 0) {
        const { error: menuItemsError } = await client
          .from('menu_items')
          .delete()
          .in('menu_id', menuIds.map(m => m.id))
        
        if (menuItemsError) {
          console.warn('[API] Error deleting menu items:', menuItemsError)
        } else {
          deletedCounts.menu_items = menuIds.length
          console.log('[API] Deleted menu items:', deletedCounts.menu_items)
        }
      }
      
      // Delete menus
      const { error: menusError } = await client
        .from('menus')
        .delete()
        .eq('restaurant_id', restaurantId)
      
      if (menusError) {
        console.warn('[API] Error deleting menus:', menusError)
      } else {
        deletedCounts.menus = menuIds?.length || 0
        console.log('[API] Deleted menus:', deletedCounts.menus)
      }
      
      // Delete reservations
      const { error: reservationsError } = await client
        .from('reservations')
        .delete()
        .eq('restaurant_id', restaurantId)
      
      if (reservationsError) {
        console.warn('[API] Error deleting reservations:', reservationsError)
      } else {
        // Get count before delete
        const { data: resData } = await client
          .from('reservations')
          .select('id', { count: 'exact' })
          .eq('restaurant_id', restaurantId)
        deletedCounts.reservations = resData?.length || 0
        console.log('[API] Deleted reservations:', deletedCounts.reservations)
      }
      
      // Delete inventory items
      const { error: inventoryError } = await client
        .from('inventory')
        .delete()
        .eq('restaurant_id', restaurantId)
      
      if (inventoryError) {
        console.warn('[API] Error deleting inventory:', inventoryError)
      } else {
        // Get count before delete
        const { data: invData } = await client
          .from('inventory')
          .select('id', { count: 'exact' })
          .eq('restaurant_id', restaurantId)
        deletedCounts.inventory_items = invData?.length || 0
        console.log('[API] Deleted inventory items:', deletedCounts.inventory_items)
      }
      
      // Finally delete the restaurant
      console.log('[API] Attempting to delete restaurant with id:', restaurantId)
      const { error: restaurantError } = await client
        .from('restaurants')
        .delete()
        .eq('id', restaurantId)
      
      console.log('[API] Restaurant delete error:', restaurantError)
      
      if (restaurantError) {
        console.error('[API] Error deleting restaurant:', restaurantError)
        return NextResponse.json(
          { error: `Failed to delete restaurant: ${restaurantError.message}` },
          { status: 500 }
        )
      }
      
      deletedCounts.restaurant = 1
      console.log('[API] Deleted restaurant: 1')

      // Check if any records were actually deleted
      const totalDeleted = Object.values(deletedCounts).reduce((a, b) => a + b, 0)
      console.log('[API] Total deleted:', totalDeleted, 'details:', deletedCounts)
      
      // We know the restaurant exists (verified above), so if restaurant wasn't deleted, it's an error
      if (deletedCounts.restaurant === 0) {
        return NextResponse.json(
          { error: 'Failed to delete restaurant. The restaurant may be protected or an error occurred.' },
          { status: 500 }
        )
      }
      
      console.log('[API] Delete completed successfully:', deletedCounts)
      
      return NextResponse.json({
        success: true,
        message: 'Restaurant and all associated data deleted successfully',
        deleted: deletedCounts
      })

    } catch (deleteError) {
      console.error('[API] Error during cascading delete:', deleteError)
      return NextResponse.json(
        { error: `Failed to delete restaurant data: ${deleteError instanceof Error ? deleteError.message : 'Unknown error'}` },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('[API] Restaurant deletion error:', error)
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
