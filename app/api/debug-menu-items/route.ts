/**
 * @fileoverview Debug Menu Items API Route
 * Checks menu items data for debugging
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get all menus with their items
    const { data: menus, error } = await supabase
      .from('menus')
      .select(`
        id,
        name,
        menu_items (
          id,
          name,
          description,
          price,
          availability
        )
      `)
    
    if (error) {
      console.error('[Debug] Error fetching menus:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    console.log('[Debug] Menus with items:', menus?.length || 0)
    
    const menuDetails = menus?.map(menu => ({
      menuName: menu.name,
      menuId: menu.id,
      itemCount: menu.menu_items?.length || 0,
      items: menu.menu_items?.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        available: item.availability
      })) || []
    })) || []
    
    return NextResponse.json({
      message: 'Menu items debug data',
      menus: menuDetails
    })

  } catch (error) {
    console.error('[Debug] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
