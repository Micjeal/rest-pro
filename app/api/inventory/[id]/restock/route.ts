/**
 * @fileoverview Inventory Restock API Route
 * Handles restocking operations for specific inventory items
 * 
 * Route:
 * - POST /api/inventory/[id]/restock - Add quantity to a specific inventory item
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/inventory/[id]/restock
 * Adds quantity to an existing inventory item
 * 
 * @param params - Route parameters containing the inventory item ID
 * @param request - NextJS request with JSON body:
 *   {
 *     quantity: number (required, positive)
 *   }
 * 
 * @returns Updated inventory item object (200) or error
 * 
 * Success Response (200):
 * {
 *   id: "uuid",
 *   restaurant_id: "uuid",
 *   item_name: "Tomatoes",
 *   quantity: 85, // Updated quantity
 *   unit: "lbs",
 *   reorder_level: 20,
 *   last_updated: "2024-01-01T15:30:00Z"
 * }
 * 
 * Error Responses:
 * - 400: Invalid data or database error
 * - 404: Item not found
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params

  try {
    const body = await request.json()
    const { quantity } = body

    if (typeof quantity !== 'number' || quantity <= 0) {
      return NextResponse.json({ error: 'Quantity must be a positive number' }, { status: 400 })
    }

    // First get current item to add to existing quantity
    const { data: currentItem, error: fetchError } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !currentItem) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 })
    }

    // Update with new quantity (current + restock amount)
    const newQuantity = currentItem.quantity + quantity

    const { data, error } = await supabase
      .from('inventory')
      .update({ 
        quantity: newQuantity,
        last_updated: new Date().toISOString()
      })
      .eq('id', id)
      .select()

    if (error) {
      console.error('[API] POST inventory/[id]/restock error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error('[API] POST inventory/[id]/restock parse error:', error)
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
