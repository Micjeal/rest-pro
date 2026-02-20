/**
 * @fileoverview Staff API Route
 * Returns staff users for assignment purposes (kitchen & management roles)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/staff
 * Returns staff users for assignment (kitchen & management roles only)
 * 
 * @returns Array of staff users or error
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    const supabase = await createClient()

    // Get user from token to verify role
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    let decodedToken
    try {
      decodedToken = JSON.parse(Buffer.from(token, 'base64').toString())
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Verify user is kitchen or management staff
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', decodedToken.userId)
      .single()

    if (userError || !currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    // Define allowed roles for staff access
    const allowedRoles = [
      // Management Roles
      'admin', 'owner', 'general_manager', 'assistant_manager', 'manager', 'shift_manager',
      // Kitchen Roles  
      'chef', 'head_chef', 'sous_chef', 'line_cook', 'prep_cook', 'grill_cook', 'fry_cook', 'pastry_chef', 'dishwasher', 'kitchen_helper',
      // Front of House Roles (for server assignment)
      'server', 'waiter', 'waitress', 'host', 'bartender', 'barista', 'sommelier', 'busser', 'runner',
      // Support Roles
      'cashier', 'delivery_driver', 'cleaner', 'security'
    ]

    if (!allowedRoles.includes(currentUser.role)) {
      return NextResponse.json({ error: 'Insufficient permissions for staff access' }, { status: 403 })
    }

    // Build query
    let query = supabase
      .from('users')
      .select('id, email, name, role, created_at, updated_at')

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    // Only return users with allowed roles
    query = query.in('role', allowedRoles).order('created_at', { ascending: false })

    const { data: users, error } = await query

    if (error) {
      console.error('[API Staff GET] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('[API Staff GET] Returning users:', users?.length || 0)

    return NextResponse.json({
      users: users || [],
      total: users?.length || 0
    })

  } catch (error) {
    console.error('[API Staff GET] Unexpected error:', error)
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 })
  }
}
