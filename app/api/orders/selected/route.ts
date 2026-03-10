/**
 * @fileoverview Selected Orders Delete API Route
 * Handles deletion of specific order IDs provided in request body
 * Restricted to admin and manager roles only
 * 
 * DELETE /api/orders/selected
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface DeleteSelectedRequest {
  orderIds: string[]
  confirmation: string
}

/**
 * DELETE /api/orders/selected
 * Deletes specific orders by their IDs
 * Only accessible by admin and manager roles
 */
export async function DELETE(request: NextRequest) {
  try {
    // Parse request body
    const body: DeleteSelectedRequest = await request.json()
    
    // Validate required fields
    if (!body || !Array.isArray(body.orderIds) || body.orderIds.length === 0 || body.confirmation !== 'DELETE') {
      return NextResponse.json({ 
        error: 'Invalid request. Required: orderIds (array), confirmation="DELETE"' 
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
      console.log('[API] Selected delete access denied:', { userId: user?.id, role: user?.role, authError })
      return NextResponse.json({ 
        error: 'Unauthorized - Admin or Manager role required', 
        details: authError?.message 
      }, { status: 401 })
    }

    const supabase = await createClient()
    
    console.log('[API] Selected delete criteria:', { 
      orderIds: body.orderIds,
      orderCount: body.orderIds.length,
      requestedBy: user.email 
    })

    // First, verify all orders exist and get their details
    const { data: existingOrders, error: fetchError } = await supabase
      .from('orders')
      .select('id, status, created_at, total_amount, customer_name')
      .in('id', body.orderIds)

    if (fetchError) {
      console.error('[API] Error fetching orders for deletion:', fetchError)
      return NextResponse.json({ error: 'Failed to verify orders' }, { status: 500 })
    }

    if (!existingOrders || existingOrders.length === 0) {
      return NextResponse.json({ 
        deletedCount: 0, 
        message: 'No valid orders found for deletion' 
      })
    }

    // Log order details for audit
    const orderDetails = existingOrders.map(order => ({
      id: order.id,
      status: order.status,
      created_at: order.created_at,
      amount: order.total_amount,
      customer: order.customer_name
    }))

    console.log('[API] Orders to be deleted:', orderDetails)

    // Perform deletion
    const { error: deleteError, count } = await supabase
      .from('orders')
      .delete()
      .in('id', body.orderIds)

    if (deleteError) {
      console.error('[API] Selected delete error:', deleteError)
      return NextResponse.json({ 
        error: 'Failed to delete orders', 
        details: deleteError.message 
      }, { status: 500 })
    }

    const deletedCount = count || existingOrders.length

    console.log('[API] Selected delete completed:', { 
      deletedCount, 
      requestedBy: user.email,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      deletedCount,
      deletedOrders: orderDetails,
      message: `Successfully deleted ${deletedCount} orders`
    })

  } catch (error) {
    console.error('[API] Selected delete unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
