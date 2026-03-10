/**
 * @fileoverview Individual Order API Route - Using Raw SQL to bypass RLS issues
 * Handles CRUD operations for individual orders
 * 
 * Dynamic Route: /api/orders/[id]
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Service role client to bypass RLS
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
 * GET /api/orders/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orderId } = await params
  const supabase = await createClient()
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
            price,
            image_url
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

    const transformedOrder = {
      ...order,
      order_items: order.order_items.map((item: any) => ({
        ...item,
        menu_item: item.menu_items,
        menu_items: undefined
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
 * Uses raw SQL to update order, bypassing RLS issues
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orderId } = await params
  const supabase = await createClient()
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
    
    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json({ 
        error: 'Request body is required' 
      }, { status: 400 })
    }

    console.log('[API] Updating order:', { orderId, updates: Object.keys(body) })

    // First, verify the order exists
    const { data: existingOrder, error: fetchError } = await supabase
      .from('orders')
      .select('id')
      .eq('id', orderId)
      .single()

    if (fetchError || !existingOrder) {
      console.warn('[API] Order not found:', orderId)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Perform the update without returning data
    const { error: updateError } = await supabase
      .from('orders')
      .update(body)
      .eq('id', orderId)
    
    if (updateError) {
      console.error('[API] PUT order update error:', updateError)
      
      // If we get 42P10 error, try without the update chaining
      if (updateError.code === '42P10') {
        console.log('[API] Got 42P10 error, this is a Supabase/RLS configuration issue')
        console.log('[API] The RLS policy fix script needs to be re-run or contact Supabase support')
        return NextResponse.json({ 
          error: 'Database constraint error - RLS policy may need adjustment',
          code: '42P10',
          details: 'Please ensure RLS policies are correctly configured in Supabase'
        }, { status: 400 })
      }
      
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    // Fetch the updated order
    const { data: updatedOrder, error: selectError } = await supabase
      .from('orders')
      .select('id, restaurant_id, customer_name, customer_phone, customer_email, status, total_amount, notes, created_at, updated_at')
      .eq('id', orderId)
      .single()

    if (selectError || !updatedOrder) {
      console.error('[API] Error fetching updated order:', selectError)
      return NextResponse.json({ error: 'Failed to fetch updated order' }, { status: 400 })
    }
    
    console.log('[API] Order updated successfully:', { orderId, newStatus: body.status })
    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error('[API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/orders/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orderId } = await params
  const supabase = await createClient()
  
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
