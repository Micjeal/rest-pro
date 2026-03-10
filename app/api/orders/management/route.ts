/**
 * @fileoverview Orders Management API Route
 * Enhanced orders endpoint for the Order Management Panel
 * Supports advanced filtering, sorting, and pagination
 * 
 * GET /api/orders/management
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/orders/management
 * Retrieves orders with enhanced filtering and sorting capabilities
 * 
 * Query Parameters:
 * - limit: Number of orders to return (default: 100)
 * - offset: Pagination offset (default: 0)
 * - status: Filter by status (comma-separated)
 * - search: Search by customer name
 * - dateFrom: Filter orders from this date
 * - dateTo: Filter orders to this date
 * - minAge: Filter orders older than this many days
 * - maxAge: Filter orders younger than this many days
 * - sortBy: Sort field (created_at, total_amount, customer_name)
 * - sortDirection: Sort direction (asc, desc)
 * - restaurantId: Filter by restaurant ID
 */

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status')
    const searchTerm = searchParams.get('search')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const minAge = searchParams.get('minAge')
    const maxAge = searchParams.get('maxAge')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortDirection = searchParams.get('sortDirection') || 'desc'
    const restaurantId = searchParams.get('restaurantId')

    console.log('[API] Orders management request:', {
      limit,
      offset,
      status,
      searchTerm,
      dateFrom,
      dateTo,
      minAge,
      maxAge,
      sortBy,
      sortDirection,
      restaurantId
    })

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
        } else {
          authError = userError
        }
      } catch (tokenError) {
        console.error('[API] Invalid token format:', tokenError)
        authError = new Error('Invalid token format')
      }
    }

    if (authError || !user) {
      console.log('[API] Orders management access denied:', { userId: user?.id, authError })
      return NextResponse.json({ 
        error: 'Unauthorized', 
        details: authError?.message 
      }, { status: 401 })
    }

    // Build the query
    let query = supabase
      .from('orders')
      .select(`
        id,
        restaurant_id,
        customer_name,
        customer_phone,
        customer_email,
        status,
        total_amount,
        notes,
        created_at,
        updated_at,
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

    // Apply filters
    if (restaurantId) {
      query = query.eq('restaurant_id', restaurantId)
    }

    if (status) {
      const statusValues = status.split(',').map(s => s.trim())
      query = query.in('status', statusValues)
    }

    if (searchTerm) {
      query = query.ilike('customer_name', `%${searchTerm}%`)
    }

    if (dateFrom) {
      query = query.gte('created_at', dateFrom)
    }

    if (dateTo) {
      query = query.lte('created_at', dateTo)
    }

    // Apply age filters
    if (minAge) {
      const minAgeDate = new Date()
      minAgeDate.setDate(minAgeDate.getDate() - parseInt(minAge))
      query = query.lte('created_at', minAgeDate.toISOString())
    }

    if (maxAge) {
      const maxAgeDate = new Date()
      maxAgeDate.setDate(maxAgeDate.getDate() - parseInt(maxAge))
      query = query.gte('created_at', maxAgeDate.toISOString())
    }

    // Apply sorting
    if (sortBy && ['created_at', 'total_amount', 'customer_name'].includes(sortBy)) {
      query = query.order(sortBy, { ascending: sortDirection === 'asc' })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    // Execute the query
    const { data: orders, error: ordersError, count } = await query

    if (ordersError) {
      console.error('[API] Orders management error:', ordersError)
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }

    // Get total count for pagination
    let totalCount = count || 0
    if (totalCount === 0) {
      // If count is not available, get it separately
      const { count: totalCountResult } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
      
      totalCount = totalCountResult || 0
    }

    console.log('[API] Orders management success:', {
      returnedOrders: orders?.length || 0,
      totalCount,
      requestedBy: user.email
    })

    return NextResponse.json({
      orders: orders || [],
      totalCount,
      limit,
      offset,
      hasMore: offset + limit < totalCount
    })

  } catch (error) {
    console.error('[API] Orders management unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
