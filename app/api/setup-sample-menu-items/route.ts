/**
 * @fileoverview Setup Sample Menu Items API Route
 * Creates sample menu items for existing menus
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    console.log('[Setup] Creating sample menu items for existing menus...')

    // Get all menus with their items
    const { data: menus, error: fetchError } = await supabase
      .from('menus')
      .select('id, name, restaurant_id')
    
    if (fetchError) {
      console.error('[Setup] Error fetching menus:', fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!menus || menus.length === 0) {
      return NextResponse.json({ error: 'No menus found' }, { status: 404 })
    }

    // Sample menu items for different menu types
    const sampleItems = [
      // Lunch Menu Items
      {
        name: 'Caesar Salad',
        description: 'Crisp romaine lettuce with parmesan cheese and croutons',
        price: 12.99,
        availability: true
      },
      {
        name: 'Grilled Chicken Sandwich',
        description: 'Grilled chicken breast with lettuce, tomato, and mayo on sourdough',
        price: 14.99,
        availability: true
      },
      {
        name: 'Tomato Soup',
        description: 'Fresh tomato soup with herbs and croutons',
        price: 8.99,
        availability: true
      },
      {
        name: 'French Fries',
        description: 'Crispy golden french fries with sea salt',
        price: 4.99,
        availability: true
      },
      {
        name: 'Iced Tea',
        description: 'Freshly brewed iced tea with lemon',
        price: 2.99,
        availability: true
      },
      {
        name: 'Chocolate Cake',
        description: 'Decadent chocolate cake with chocolate frosting',
        price: 6.99,
        availability: true
      },
      // Dinner Menu Items
      {
        name: 'Grilled Salmon',
        description: 'Atlantic salmon grilled with lemon butter and herbs',
        price: 24.99,
        availability: true
      },
      {
        name: 'Steak Frites',
        description: 'Prime cut steak frites with garlic aioli',
        price: 18.99,
        availability: true
      },
      {
        name: 'Wine Selection',
        description: 'Curated selection of red and white wines',
        price: 8.99,
        availability: true
      },
      {
        name: 'Cheese Board',
        description: 'Assorted artisanal cheeses with crackers and fruits',
        price: 12.99,
        availability: true
      },
      {
        name: 'Tiramisu',
        description: 'Classic Italian coffee-flavored dessert with mascarpone',
        price: 9.99,
        availability: true
      }
    ]

    // Create items for each menu
    const itemPromises = menus.map(async (menu) => {
      const itemsForMenu = sampleItems.slice(0, 6) // 6 items per menu
      
      const { data: createdItems, error: insertError } = await supabase
        .from('menu_items')
        .insert(itemsForMenu.map(item => ({
          menu_id: menu.id,
          name: item.name,
          description: item.description,
          price: item.price,
          availability: item.availability
        })))
        .select()
      
      return {
        menuId: menu.id,
        menuName: menu.name,
        createdItems,
        insertError
      }
    })

    const results = await Promise.all(itemPromises)
    
    // Count successful item creations
    const successCount = results.filter(r => !r.insertError).length
    const errorCount = results.length - successCount

    console.log(`[Setup] Created items for ${successCount} menus, ${errorCount} errors`)

    return NextResponse.json({
      message: `Sample menu items created for ${successCount} menus`,
      successCount,
      errorCount,
      totalItems: successCount * 6, // 6 items per menu
      results: results.map(r => ({
        menuId: r.menuId,
        menuName: r.menuName,
        itemCount: r.createdItems?.length || 0,
        items: r.createdItems || []
      }))
    })

  } catch (error) {
    console.error('[Setup] Unexpected error:', error)
    return NextResponse.json({ error: 'Failed to setup sample menu items' }, { status: 500 })
  }
}
