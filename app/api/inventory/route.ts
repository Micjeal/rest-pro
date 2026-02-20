/**
 * @fileoverview Inventory API Route
 * Handles CRUD operations for restaurant inventory management
 * 
 * Query Parameters:
 * - restaurantId: UUID of the restaurant (required for GET)
 * - id: UUID of the inventory item (required for DELETE)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/inventory?restaurantId=<uuid>
 * Retrieves all inventory items for a specific restaurant
 * Inventory items are sorted alphabetically by name
 * 
 * @param request - NextJS request with restaurantId query parameter
 * @returns JSON array of inventory items or error
 * 
 * Success Response (200):
 * [
 *   {
 *     id: "uuid",
 *     restaurant_id: "uuid",
 *     item_name: "Tomatoes",
 *     quantity: 45,
 *     unit: "lbs",
 *     reorder_level: 20,
 *     last_updated: "2024-01-01T12:00:00Z"
 *   }
 * ]
 * 
 * Error Responses:
 * - 400: Missing restaurantId or database error
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const restaurantId = request.nextUrl.searchParams.get('restaurantId')

  if (!restaurantId) {
    return NextResponse.json({ error: 'Restaurant ID required' }, { status: 400 })
  }

  const { data: inventory, error } = await supabase
    .from('inventory')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('item_name', { ascending: true })

  if (error) {
    console.error('[API] GET inventory error:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(inventory)
}

/**
 * POST /api/inventory
 * Creates a new inventory item
 * 
 * @param request - NextJS request with JSON body:
 *   {
 *     restaurant_id: string (uuid, required),
 *     item_name: string (required),
 *     quantity: number (required),
 *     unit?: string (e.g., "lbs", "oz", "count"),
 *     reorder_level?: number (default: 10)
 *   }
 * 
 * @returns Created inventory item object (201) or error
 * 
 * Success Response (201):
 * {
 *   id: "uuid",
 *   restaurant_id: "uuid",
 *   item_name: "Tomatoes",
 *   quantity: 50,
 *   unit: "lbs",
 *   reorder_level: 20,
 *   last_updated: "2024-01-01T12:00:00Z"
 * }
 * 
 * Error Responses:
 * - 400: Invalid data or database error
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  try {
    const body = await request.json()

    const { data, error } = await supabase
      .from('inventory')
      .insert([body])
      .select()

    if (error) {
      console.error('[API] POST inventory error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error('[API] POST inventory parse error:', error)
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

/**
 * PUT /api/inventory
 * Updates an existing inventory item
 * 
 * @param request - NextJS request with JSON body:
 *   {
 *     id: string (uuid, required),
 *     quantity?: number,
 *     unit?: string,
 *     reorder_level?: number
 *   }
 * 
 * @returns Updated inventory item object (200) or error
 * 
 * Success Response (200):
 * {
 *   id: "uuid",
 *   restaurant_id: "uuid",
 *   item_name: "Tomatoes",
 *   quantity: 35,
 *   unit: "lbs",
 *   reorder_level: 25,
 *   last_updated: "2024-01-01T15:30:00Z"
 * }
 * 
 * Error Responses:
 * - 400: Invalid data or database error
 */
export async function PUT(request: NextRequest) {
  const supabase = await createClient()

  try {
    const { id, ...body } = await request.json()

    const { data, error } = await supabase
      .from('inventory')
      .update(body)
      .eq('id', id)
      .select()

    if (error) {
      console.error('[API] PUT inventory error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error('[API] PUT inventory parse error:', error)
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

/**
 * DELETE /api/inventory?id=<uuid>
 * Deletes an inventory item
 * 
 * @param request - NextJS request with id query parameter
 * @returns Success message (200) or error
 * 
 * Success Response (200):
 * {
 *   success: true
 * }
 * 
 * Error Responses:
 * - 400: Missing id or database error
 */
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const id = request.nextUrl.searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Item ID required' }, { status: 400 })
  }

  const { error } = await supabase.from('inventory').delete().eq('id', id)

  if (error) {
    console.error('[API] DELETE inventory error:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
