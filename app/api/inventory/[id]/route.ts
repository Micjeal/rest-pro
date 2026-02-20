/**
 * @fileoverview Individual Inventory Item API Route
 * Handles operations for specific inventory items by ID
 * 
 * Routes:
 * - PUT /api/inventory/[id] - Update a specific inventory item
 * - DELETE /api/inventory/[id] - Delete a specific inventory item
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * PUT /api/inventory/[id]
 * Updates an existing inventory item by ID
 * 
 * @param params - Route parameters containing the inventory item ID
 * @param request - NextJS request with JSON body:
 *   {
 *     item_name?: string,
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
 * - 404: Item not found
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params

  try {
    const body = await request.json()

    const { data, error } = await supabase
      .from('inventory')
      .update(body)
      .eq('id', id)
      .select()

    if (error) {
      console.error('[API] PUT inventory/[id] error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error('[API] PUT inventory/[id] parse error:', error)
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

/**
 * DELETE /api/inventory/[id]
 * Deletes a specific inventory item by ID
 * 
 * @param params - Route parameters containing the inventory item ID
 * @returns Success message (200) or error
 * 
 * Success Response (200):
 * {
 *   success: true
 * }
 * 
 * Error Responses:
 * - 400: Database error
 * - 404: Item not found
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params

  // First check if item exists
  const { data: existingItem } = await supabase
    .from('inventory')
    .select('id')
    .eq('id', id)
    .single()

  if (!existingItem) {
    return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 })
  }

  const { error } = await supabase
    .from('inventory')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('[API] DELETE inventory/[id] error:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
