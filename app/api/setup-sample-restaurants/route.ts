/**
 * @fileoverview Setup Sample Restaurants API Route
 * Creates sample restaurants for testing
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    console.log('[Setup] Creating sample restaurants...')

    // Create sample restaurants (use any existing user as owner)
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .limit(1)
      .single()

    const ownerId = existingUser?.id || '00000000-0000-0000-0000-000000000000'

    const sampleRestaurants = [
      {
        name: 'Main Restaurant',
        address: '123 Main Street, New York, NY 10001',
        phone: '(555) 123-4567',
        email: 'main@restaurant.com',
        owner_id: ownerId
      },
      {
        name: 'Downtown Cafe',
        address: '456 Oak Avenue, Los Angeles, CA 90001',
        phone: '(555) 234-5678',
        email: 'cafe@restaurant.com',
        owner_id: ownerId
      },
      {
        name: 'Test Restaurant',
        address: '789 Elm Street, Chicago, IL 60007',
        phone: '(555) 345-6789',
        email: 'test@restaurant.com',
        owner_id: ownerId
      }
    ]

    // Insert restaurants (simpler approach)
    const { data: restaurants, error } = await supabase
      .from('restaurants')
      .insert(sampleRestaurants)
      .select()

    if (error) {
      console.error('[Setup] Error creating restaurants:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('[Setup] Created restaurants:', restaurants?.length || 0)

    // Create sample menus for each restaurant
    for (const restaurant of restaurants || []) {
      const { data: menus, error: menuError } = await supabase
        .from('menus')
        .insert([
          {
            restaurant_id: restaurant.id,
            name: 'Main Menu',
            description: 'Our delicious main menu items'
          },
          {
            restaurant_id: restaurant.id,
            name: 'Drinks',
            description: 'Refreshing beverages and drinks'
          }
        ])
        .select()

      if (menuError) {
        console.error('[Setup] Error creating menus for', restaurant.name, menuError)
      } else {
        console.log('[Setup] Created menus for', restaurant.name, ':', menus?.length || 0)

        // Add sample menu items for each menu
        for (const menu of menus || []) {
          const sampleItems = [
            {
              menu_id: menu.id,
              name: menu.name === 'Main Menu' ? 'Burger' : 'Coffee',
              description: menu.name === 'Main Menu' ? 'Juicy beef burger with fries' : 'Freshly brewed coffee',
              price: menu.name === 'Main Menu' ? 12.99 : 3.99,
              availability: true
            },
            {
              menu_id: menu.id,
              name: menu.name === 'Main Menu' ? 'Salad' : 'Tea',
              description: menu.name === 'Main Menu' ? 'Fresh garden salad' : 'Hot herbal tea',
              price: menu.name === 'Main Menu' ? 8.99 : 2.99,
              availability: true
            }
          ]

          const { data: items, error: itemError } = await supabase
            .from('menu_items')
            .insert(sampleItems)
            .select()

          if (itemError) {
            console.error('[Setup] Error creating menu items for', menu.name, itemError)
          } else {
            console.log('[Setup] Created menu items for', menu.name, ':', items?.length || 0)
          }
        }
      }
    }

    return NextResponse.json({
      message: 'Sample restaurants and menus created successfully',
      restaurants: restaurants?.length || 0,
      menus: 'Sample menus and items created for each restaurant'
    })

  } catch (error) {
    console.error('[Setup] Unexpected error:', error)
    return NextResponse.json({ error: 'Failed to setup sample data' }, { status: 500 })
  }
}
