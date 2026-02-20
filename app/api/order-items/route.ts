/**
 * @fileoverview Order Items API Route
 * Handles CRUD operations for items within orders
 * 
 * Query Parameters:
 * - orderId: UUID of the order (required for GET)
 * - id: UUID of the order item (required for DELETE)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/order-items?orderId=<uuid>
 * Retrieves all items for a specific order
 * 
 * @param request - NextJS request with orderId query parameter
 * @returns JSON array of order items or error
 * 
 * Success Response (200):
 * [
 *   {
 *     id: "uuid",
 *     order_id: "uuid",
 *     menu_item_id: "uuid",
 *     quantity: 2,
 *     unit_price: "12.99",
 *     subtotal: "25.98",
 *     created_at: "2024-01-01T00:00:00Z"
 *   }
 * ]
 * 
 * Error Responses:
 * - 400: Missing orderId or database error
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  
  // Check for custom token in Authorization header
  const authHeader = request.headers.get('Authorization')
  let user = null
  let authError = null

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7)
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
      
      // Validate user from database using decoded token
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, role')
        .eq('id', decoded.userId)
        .eq('email', decoded.email)
        .single()
      
      if (!userError && userData) {
        user = userData
        console.log('[Order Items API] Authenticated user via custom token:', user.email)
      } else {
        authError = userError
      }
    } catch (tokenError) {
      console.error('[Order Items API] Invalid token format:', tokenError)
      authError = new Error('Invalid token format')
    }
  } else {
    // Fallback to Supabase auth for backward compatibility
    const { data: { user: supabaseUser }, error: supabaseAuthError } = await supabase.auth.getUser()
    user = supabaseUser
    authError = supabaseAuthError
  }

  if (authError || !user) {
    console.log('[Order Items API] No authenticated user found')
    return NextResponse.json({ error: 'Unauthorized - Please login', details: authError?.message }, { status: 401 })
  }
  
  const orderId = request.nextUrl.searchParams.get('orderId')

  if (!orderId) {
    return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
  }

  const { data: items, error } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId)

  if (error) {
    console.error('[Order Items API] GET order items error:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(items)
}

/**
 * POST /api/order-items
 * Adds items to an order
 * 
 * @param request - NextJS request with JSON body:
 *   {
 *     order_id: string (uuid, required),
 *     menu_item_id: string (uuid, required),
 *     quantity: number (required),
 *     unit_price: number (required),
 *     subtotal: number (required)
 *   }
 * 
 * @returns Created order item object (201) or error
 * 
 * Success Response (201):
 * {
 *   id: "uuid",
 *   order_id: "uuid",
 *   menu_item_id: "uuid",
 *   quantity: 2,
 *   unit_price: "12.99",
 *   subtotal: "25.98",
 *   created_at: "2024-01-01T00:00:00Z"
 * }
 * 
 * Error Responses:
 * - 400: Invalid data or database error
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Check for custom token in Authorization header
  const authHeader = request.headers.get('Authorization')
  let user = null
  let authError = null

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7)
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
      
      // Validate user from database using decoded token
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, role')
        .eq('id', decoded.userId)
        .eq('email', decoded.email)
        .single()
      
      if (!userError && userData) {
        user = userData
        console.log('[Order Items API] Authenticated user via custom token:', user.email)
      } else {
        authError = userError
      }
    } catch (tokenError) {
      console.error('[Order Items API] Invalid token format:', tokenError)
      authError = new Error('Invalid token format')
    }
  } else {
    // Fallback to Supabase auth for backward compatibility
    const { data: { user: supabaseUser }, error: supabaseAuthError } = await supabase.auth.getUser()
    user = supabaseUser
    authError = supabaseAuthError
  }

  if (authError || !user) {
    console.log('[Order Items API] No authenticated user found')
    return NextResponse.json({ error: 'Unauthorized - Please login', details: authError?.message }, { status: 401 })
  }

  try {
    const body = await request.json()

    const { data, error } = await supabase
      .from('order_items')
      .insert([body])
      .select()

    if (error) {
      console.error('[Order Items API] POST order item error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error('[Order Items API] POST order item parse error:', error)
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

/**
 * DELETE /api/order-items?id=<uuid>
 * Removes an item from an order
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
  
  // Check for custom token in Authorization header
  const authHeader = request.headers.get('Authorization')
  let user = null
  let authError = null

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7)
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
      
      // Validate user from database using decoded token
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, role')
        .eq('id', decoded.userId)
        .eq('email', decoded.email)
        .single()
      
      if (!userError && userData) {
        user = userData
        console.log('[Order Items API] Authenticated user via custom token:', user.email)
      } else {
        authError = userError
      }
    } catch (tokenError) {
      console.error('[Order Items API] Invalid token format:', tokenError)
      authError = new Error('Invalid token format')
    }
  } else {
    // Fallback to Supabase auth for backward compatibility
    const { data: { user: supabaseUser }, error: supabaseAuthError } = await supabase.auth.getUser()
    user = supabaseUser
    authError = supabaseAuthError
  }

  if (authError || !user) {
    console.log('[Order Items API] No authenticated user found')
    return NextResponse.json({ error: 'Unauthorized - Please login', details: authError?.message }, { status: 401 })
  }
  
  const id = request.nextUrl.searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Item ID required' }, { status: 400 })
  }

  const { error } = await supabase.from('order_items').delete().eq('id', id)

  if (error) {
    console.error('[Order Items API] DELETE order item error:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
