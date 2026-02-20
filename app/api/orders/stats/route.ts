/**
 * Orders Stats API Route
 * GET /api/orders/stats?restaurantId=<uuid>
 * Returns statistics for dashboard
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
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
          console.log('[Orders Stats API] Authenticated user via custom token:', user.email)
        } else {
          authError = userError
        }
      } catch (tokenError) {
        console.error('[Orders Stats API] Invalid token format:', tokenError)
        authError = new Error('Invalid token format')
      }
    } else {
      // Fallback to Supabase auth for backward compatibility
      const { data: { user: supabaseUser }, error: supabaseAuthError } = await supabase.auth.getUser()
      user = supabaseUser
      authError = supabaseAuthError
    }

    if (authError || !user) {
      console.log('[Orders Stats API] No authenticated user found')
      return NextResponse.json({ error: 'Unauthorized - Please login' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')

    console.log('[Orders Stats API] Fetching stats for user:', user.id, 'restaurantId:', restaurantId)

    // Get total orders and revenue
    let totalStats, totalError, todayStats, todayError
    if (restaurantId) {
      // Get stats for specific restaurant
      const statsResult = await Promise.all([
        supabase
          .from('orders')
          .select('total_amount')
          .eq('restaurant_id', restaurantId)
          .eq('status', 'completed'),
        supabase
          .from('orders')
          .select('total_amount')
          .eq('restaurant_id', restaurantId)
          .eq('status', 'completed')
          .gte('created_at', `${new Date().toISOString().split('T')[0]}T00:00:00Z`)
          .lte('created_at', `${new Date().toISOString().split('T')[0]}T23:59:59Z`)
      ])
      
      totalStats = statsResult[0].data
      totalError = statsResult[0].error
      todayStats = statsResult[1].data
      todayError = statsResult[1].error
    } else {
      // Get overall stats for all restaurants (admin/manager only)
      const statsResult = await Promise.all([
        supabase
          .from('orders')
          .select('total_amount')
          .eq('status', 'completed'),
        supabase
          .from('orders')
          .select('total_amount')
          .eq('status', 'completed')
          .gte('created_at', `${new Date().toISOString().split('T')[0]}T00:00:00Z`)
          .lte('created_at', `${new Date().toISOString().split('T')[0]}T23:59:59Z`)
      ])
      
      totalStats = statsResult[0].data
      totalError = statsResult[0].error
      todayStats = statsResult[1].data
      todayError = statsResult[1].error
    }

    if (totalError || todayError) {
      console.error('[Orders Stats API] Error fetching stats:', { totalError, todayError })
      return NextResponse.json({ error: 'Failed to fetch order statistics' }, { status: 500 })
    }

    // Calculate statistics
    const totalOrders = totalStats?.length || 0
    const totalRevenue = totalStats?.reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0
    const todayOrders = todayStats?.length || 0
    const todayRevenue = todayStats?.reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0

    const stats = {
      totalOrders,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      todayOrders,
      todayRevenue: Math.round(todayRevenue * 100) / 100
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('[Orders Stats API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
