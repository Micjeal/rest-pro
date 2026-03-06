/**
 * @fileoverview Individual Order API Route
 * Handles CRUD operations for individual orders
 * 
 * Dynamic Route: /api/orders/[id]
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/orders/[id]
 * Retrieves a specific order with its items
 * 
 * @param request - NextJS request
 * @returns Order object with items or error
 * 
 * Success Response (200):
 * {
 *   id: "uuid",
 *   restaurant_id: "uuid",
 *   customer_name: "John Doe",
 *   customer_phone: "555-1234",
 *   customer_email: "john@example.com",
 *   status: "pending",
 *   total_amount: "45.99",
 *   notes: "Extra sauce on the side",
 *   created_at: "2024-01-01T00:00:00Z",
 *   updated_at: "2024-01-01T00:00:00Z",
 *   order_items: [
 *     {
 *       id: "uuid",
 *       order_id: "uuid",
 *       menu_item_id: "uuid",
 *       quantity: 2,
 *       unit_price: "12.99",
 *       subtotal: "25.98",
 *       menu_item: {
 *         name: "Classic Burger",
 *         description: "Juicy beef patty with lettuce, tomato, and onion",
 *         price: "12.99"
 *       }
 *     }
 *   ]
 * }
 * 
 * Error Responses:
 * - 400: Database error
 * - 404: Order not found
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id: orderId } = await params

  try {
    // Get order with items and menu item details
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          menu_items (
            name,
            description,
            price
          )
        )
      `)
      .eq('id', orderId)
      .single()

    if (error) {
      console.error('[API] GET order error:', error)
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Transform the data to match expected format
    const transformedOrder = {
      ...order,
      order_items: order.order_items.map((item: any) => ({
        ...item,
        menu_item: item.menu_items,
        menu_items: undefined // Remove the nested menu_items object
      }))
    }

    return NextResponse.json(transformedOrder)
  } catch (error) {
    console.error('[API] GET order unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/orders/[id]
 * Updates an existing order
 * 
 * @param request - NextJS request with JSON body:
 *   - customer_name?: string
 *   - customer_phone?: string
 *   - customer_email?: string
 *   - status?: string
 *   - total_amount?: number
 *   - notes?: string
 * 
 * @returns Updated order object (200) or error
 * 
 * Success Response (200):
 * {
 *   id: "uuid",
 *   restaurant_id: "uuid",
 *   customer_name: "John Doe",
 *   customer_phone: "555-1234",
 *   customer_email: "john@example.com",
 *   status: "confirmed",
 *   total_amount: "45.99",
 *   notes: "Updated notes",
 *   created_at: "2024-01-01T00:00:00Z",
 *   updated_at: "2024-01-01T00:00:00Z"
 * }
 * 
 * Error Responses:
 * - 400: Invalid data or database error
 * - 401: Unauthorized
 * - 404: Order not found
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id: orderId } = await params

  // Check for authentication
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
        console.log('[API] Authenticated user via custom token:', user.email)
      } else {
        authError = userError
      }
    } catch (tokenError) {
      console.error('[API] Invalid token format:', tokenError)
      authError = new Error('Invalid token format')
    }
  } else {
    // Fallback to Supabase auth for backward compatibility
    const { data: { user: supabaseUser }, error: supabaseAuthError } = await supabase.auth.getUser()
    user = supabaseUser
    authError = supabaseAuthError
  }

  console.log('[API] Auth check for PUT:', { userId: user?.id, authError })

  if (authError || !user) {
    console.log('[API] No authenticated user found for PUT')
    return NextResponse.json({ error: 'Unauthorized - Please login', details: authError?.message }, { status: 401 })
  }

  try {
    const body = await request.json()

    // If only status is provided, just update the status
    if (body && Object.keys(body).length === 1 && body.status) {
      const { data, error } = await supabase
        .from('orders')
        .update({ status: body.status })
        .eq('id', orderId)
        .select()
      
      if (error) {
        console.error('[API] PUT order status error:', error)
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      
      if (!data || data.length === 0) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }
      
      console.log('[API] Order status updated:', { orderId, newStatus: body.status })
      return NextResponse.json(data[0])
    }

    // If other fields are provided, update the full order
    if (body && Object.keys(body).length > 1) {
      const { data, error } = await supabase
        .from('orders')
        .update(body)
        .eq('id', orderId)
        .select()
      
      if (error) {
        console.error('[API] PUT order error:', error)
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      
      if (!data || data.length === 0) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }
      
      console.log('[API] Order updated:', { orderId })
      return NextResponse.json(data[0])
    }

    // If no body, return error
    return NextResponse.json({ 
      error: 'Request body is required' 
    }, { status: 400 })
  } catch (error) {
    console.error('[API] PUT order parse error:', error)
    return NextResponse.json({ 
      error: 'Invalid request body' 
    }, { status: 400 })
  }
}

/**
 * DELETE /api/orders/[id]
 * Deletes an order and its items
 * 
 * @param request - NextJS request
 * @returns Success message (200) or error
 * 
 * Success Response (200):
 * {
 *   success: true
 * }
 * 
 * Error Responses:
 * - 400: Database error
 * - 401: Unauthorized
 * - 404: Order not found
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id: orderId } = await params

  // Check for authentication
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
        console.log('[API] Authenticated user via custom token:', user.email)
      } else {
        authError = userError
      }
    } catch (tokenError) {
      console.error('[API] Invalid token format:', tokenError)
      authError = new Error('Invalid token format')
    }
  } else {
    // Fallback to Supabase auth for backward compatibility
    const { data: { user: supabaseUser }, error: supabaseAuthError } = await supabase.auth.getUser()
    user = supabaseUser
    authError = supabaseAuthError
  }

  console.log('[API] Auth check for DELETE:', { userId: user?.id, authError })

  if (authError || !user) {
    console.log('[API] No authenticated user found for DELETE')
    return NextResponse.json({ error: 'Unauthorized - Please login', details: authError?.message }, { status: 401 })
  }

  try {
    // Delete order (cascade should handle order_items due to foreign key constraint)
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId)

    if (error) {
      console.error('[API] DELETE order error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log('[API] Order deleted:', { orderId })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API] DELETE order unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
