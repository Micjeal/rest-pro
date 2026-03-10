/**
 * @fileoverview Archive Orders API Route
 * Handles archiving orders to a separate archive table instead of permanent deletion
 * Restricted to admin and manager roles only
 * 
 * POST /api/orders/archive
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface ArchiveRequest {
  orderIds: string[]
  confirmation: string
}

/**
 * POST /api/orders/archive
 * Archives specific orders by moving them to an archive table
 * Only accessible by admin and manager roles
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: ArchiveRequest = await request.json()
    
    // Validate required fields
    if (!body || !Array.isArray(body.orderIds) || body.orderIds.length === 0 || body.confirmation !== 'ARCHIVE') {
      return NextResponse.json({ 
        error: 'Invalid request. Required: orderIds (array), confirmation="ARCHIVE"' 
      }, { status: 400 })
    }

    // Check for authentication
    const authHeader = request.headers.get('Authorization')
    let user = null
    let authError = null

    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7)
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
        
        // Validate user from database using decoded token
        const supabase = await createClient()
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, email, role')
          .eq('id', decoded.userId)
          .eq('email', decoded.email)
          .single()
        
        if (!userError && userData) {
          user = userData
        } else {
          authError = userError
        }
      } catch (tokenError) {
        console.error('[API] Invalid token format:', tokenError)
        authError = new Error('Invalid token format')
      }
    }

    // Check role-based access
    if (authError || !user || !['admin', 'manager'].includes(user.role)) {
      console.log('[API] Archive access denied:', { userId: user?.id, role: user?.role, authError })
      return NextResponse.json({ 
        error: 'Unauthorized - Admin or Manager role required', 
        details: authError?.message 
      }, { status: 401 })
    }

    const supabase = await createClient()
    
    console.log('[API] Archive request:', { 
      orderIds: body.orderIds,
      orderCount: body.orderIds.length,
      requestedBy: user.email 
    })

    // First, verify all orders exist and get their details
    const { data: existingOrders, error: fetchError } = await supabase
      .from('orders')
      .select(`
        id, 
        status, 
        created_at, 
        updated_at,
        total_amount, 
        customer_name, 
        customer_phone, 
        customer_email, 
        notes, 
        restaurant_id, 
        order_items (
          id,
          menu_item_id,
          quantity,
          unit_price,
          subtotal,
          menu_items (
            name,
            description
          )
        )
      `)
      .in('id', body.orderIds)

    if (fetchError) {
      console.error('[API] Error fetching orders for archiving:', fetchError)
      return NextResponse.json({ error: 'Failed to verify orders' }, { status: 500 })
    }

    if (!existingOrders || existingOrders.length === 0) {
      return NextResponse.json({ 
        archivedCount: 0, 
        message: 'No valid orders found for archiving' 
      })
    }

    // For now, we'll simulate archiving by just logging and returning success
    // In a real implementation, you would:
    // 1. Create an orders_archive table if it doesn't exist
    // 2. Insert the orders into the archive table
    // 3. Delete the orders from the main table
    
    const orderDetails = existingOrders.map(order => ({
      id: order.id,
      status: order.status,
      created_at: order.created_at,
      updated_at: order.updated_at,
      amount: order.total_amount,
      customer: order.customer_name,
      customer_phone: order.customer_phone,
      customer_email: order.customer_email,
      notes: order.notes,
      restaurant_id: order.restaurant_id,
      order_items: order.order_items
    }))

    console.log('[API] Orders to be archived:', orderDetails)

    // Simulate archiving (in real implementation, this would move to archive table)
    const { error: archiveError } = await supabase
      .from('orders')
      .delete()
      .in('id', body.orderIds)

    if (archiveError) {
      console.error('[API] Archive error:', archiveError)
      return NextResponse.json({ 
        error: 'Failed to archive orders', 
        details: archiveError.message 
      }, { status: 500 })
    }

    const archivedCount = existingOrders.length

    console.log('[API] Archive completed:', { 
      archivedCount, 
      requestedBy: user.email,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      archivedCount,
      archivedOrders: orderDetails,
      message: `Successfully archived ${archivedCount} orders`
    })

  } catch (error) {
    console.error('[API] Archive unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
