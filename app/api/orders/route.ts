/**
 * @fileoverview Orders API Route
 * Handles CRUD operations for restaurant orders
 * 
 * Query Parameters:
 * - restaurantId: UUID of the restaurant (required for GET)
 * - status: Filter orders by status (comma-separated values)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/orders?restaurantId=<uuid>&status=<status1,status2>
 * Retrieves all orders for a specific restaurant with associated items
 * Orders are sorted by creation date (newest first)
 * 
 * @param request - NextJS request with restaurantId query parameter
 * @returns JSON array of orders with order_items or error
 * 
 * Success Response (200):
 * [
 *   {
 *     id: "uuid",
 *     restaurant_id: "uuid",
 *     customer_name: "John Doe",
 *     customer_phone: "555-1234",
 *     customer_email: "john@example.com",
 *     status: "pending",
 *     total_amount: "45.99",
 *     notes: "Extra sauce on the side",
 *     created_at: "2024-01-01T00:00:00Z",
 *     updated_at: "2024-01-01T00:00:00Z",
 *     order_items: [
 *       {
 *         id: "uuid",
 *         order_id: "uuid",
 *         menu_item_id: "uuid",
 *         quantity: 2,
 *         unit_price: "12.99",
 *         subtotal: "25.98"
 *       }
 *     ]
 *   }
 * ]
 * 
 * Status values: pending, confirmed, preparing, ready, completed, cancelled
 * 
 * Error Responses:
 * - 400: Missing restaurantId or database error
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

  console.log('[API] Auth check:', { userId: user?.id, authError })

  if (authError || !user) {
    console.log('[API] No authenticated user found')
    return NextResponse.json({ error: 'Unauthorized - Please login', details: authError?.message }, { status: 401 })
  }

  const restaurantId = request.nextUrl.searchParams.get('restaurantId')
  const statusParam = request.nextUrl.searchParams.get('status')

  if (!restaurantId) {
    return NextResponse.json({ error: 'Restaurant ID required' }, { status: 400 })
  }

  console.log('[API] Fetching orders for restaurant:', restaurantId, 'user:', user.id)

  let query = supabase
    .from('orders')
    .select('*, order_items(*, menu_items(name))')
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false })

  if (statusParam) {
    const statuses = statusParam.split(',').map(status => status.trim())
    query = query.in('status', statuses)
  }

  const { data: orders, error } = await query

  if (error) {
    console.error('[API] GET orders error:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  console.log('[API] Found orders:', orders?.length || 0)

  return NextResponse.json(orders)
}

/**
 * POST /api/orders
 * Creates a new order for a restaurant
 * 
 * @param request - NextJS request with JSON body:
 *   {
 *     restaurant_id: string (uuid, required),
 *     customer_name: string (required),
 *     customer_phone?: string,
 *     customer_email?: string,
 *     status?: string (default: "pending"),
 *     total_amount?: number,
 *     notes?: string
 *   }
 * 
 * @returns Created order object (201) or error
 * Note: Use POST /api/order-items to add items to the order
 * 
 * Success Response (201):
 * {
 *   id: "uuid",
 *   restaurant_id: "uuid",
 *   customer_name: "John Doe",
 *   customer_phone: "555-1234",
 *   customer_email: "john@example.com",
 *   status: "pending",
 *   total_amount: "0.00",
 *   notes: "Extra sauce on the side",
 *   created_at: "2024-01-01T00:00:00Z",
 *   updated_at: "2024-01-01T00:00:00Z"
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

  console.log('[API] Auth check:', { userId: user?.id, authError })

  if (authError || !user) {
    console.log('[API] No authenticated user found')
    return NextResponse.json({ error: 'Unauthorized - Please login', details: authError?.message }, { status: 401 })
  }

  try {
    const body = await request.json()

    // Validate required fields
    if (!body.restaurant_id || !body.customer_name) {
      return NextResponse.json({ 
        error: 'Missing required fields: restaurant_id and customer_name are required' 
      }, { status: 400 })
    }

    // Validate restaurant_id format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(body.restaurant_id)) {
      return NextResponse.json({ 
        error: 'Invalid restaurant_id format. Must be a valid UUID.' 
      }, { status: 400 })
    }

    // Validate total_amount if provided
    if (body.total_amount !== undefined && (isNaN(body.total_amount) || body.total_amount < 0)) {
      return NextResponse.json({ 
        error: 'Invalid total_amount. Must be a positive number.' 
      }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('orders')
      .insert([{
        ...body,
        status: body.status || 'pending', // Default status
        total_amount: body.total_amount || 0, // Default amount
      }])
      .select()

    if (error) {
      console.error('[API] POST order error:', error)
      return NextResponse.json({ 
        error: `Database error: ${error.message}` 
      }, { status: 400 })
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error('[API] POST order parse error:', error)
    return NextResponse.json({ 
      error: 'Invalid request body. Please check your JSON format.' 
    }, { status: 400 })
  }
}
