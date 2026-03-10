/**
 * @fileoverview Bulk Orders Delete API Route
 * Handles bulk deletion of completed orders older than specified days
 * Restricted to admin and manager roles only
 * 
 * DELETE /api/orders/bulk
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface BulkDeleteRequest {
  status: 'completed'
  minAgeDays: number
  confirmation: string
}

/**
 * DELETE /api/orders/bulk
 * Bulk deletes orders that meet criteria (completed status + age requirement)
 * Only accessible by admin and manager roles
 */
export async function DELETE(request: NextRequest) {
  try {
    // Parse request body
    const body: BulkDeleteRequest = await request.json()
    
    // Validate required fields
    if (!body || body.status !== 'completed' || !body.minAgeDays || body.confirmation !== 'DELETE') {
      return NextResponse.json({ 
        error: 'Invalid request. Required: status="completed", minAgeDays (number), confirmation="DELETE"' 
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
      console.log('[API] Bulk delete access denied:', { userId: user?.id, role: user?.role, authError })
      return NextResponse.json({ 
        error: 'Unauthorized - Admin or Manager role required', 
        details: authError?.message 
      }, { status: 401 })
    }

    const supabase = await createClient()
    
    // Calculate date threshold (orders older than minAgeDays)
    const dateThreshold = new Date()
    dateThreshold.setDate(dateThreshold.getDate() - body.minAgeDays)
    const dateThresholdISO = dateThreshold.toISOString()

    console.log('[API] Bulk delete criteria:', { 
      status: body.status, 
      minAgeDays: body.minAgeDays, 
      dateThreshold: dateThresholdISO,
      requestedBy: user.email 
    })

    // First, count eligible orders
    const { data: eligibleOrders, error: countError } = await supabase
      .from('orders')
      .select('id, created_at')
      .eq('status', body.status)
      .lt('created_at', dateThresholdISO)

    if (countError) {
      console.error('[API] Error counting eligible orders:', countError)
      return NextResponse.json({ error: 'Failed to count eligible orders' }, { status: 500 })
    }

    if (!eligibleOrders || eligibleOrders.length === 0) {
      return NextResponse.json({ 
        deletedCount: 0, 
        message: 'No eligible orders found for deletion' 
      })
    }

    console.log(`[API] Found ${eligibleOrders.length} eligible orders for bulk deletion`)

    // Perform bulk deletion
    const { error: deleteError, count } = await supabase
      .from('orders')
      .delete()
      .eq('status', body.status)
      .lt('created_at', dateThresholdISO)

    if (deleteError) {
      console.error('[API] Bulk delete error:', deleteError)
      return NextResponse.json({ 
        error: 'Failed to delete orders', 
        details: deleteError.message 
      }, { status: 500 })
    }

    const deletedCount = count || eligibleOrders.length

    console.log('[API] Bulk delete completed:', { 
      deletedCount, 
      requestedBy: user.email,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      deletedCount,
      message: `Successfully deleted ${deletedCount} completed orders older than ${body.minAgeDays} days`
    })

  } catch (error) {
    console.error('[API] Bulk delete unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
