/**
 * @fileoverview Individual User API Route
 * Handles GET, PUT, DELETE operations for individual users (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'

/**
 * GET /api/users/[id]
 * Gets a single user by ID (admin only)
 * 
 * @param params - Route parameters containing user ID
 * @returns User object or error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get user from token to verify admin role
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

    // Verify user is admin
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', decodedToken.userId)
      .single()

    if (userError || !currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get user
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, role, created_at, updated_at')
      .eq('id', id)
      .single()

    if (error) {
      console.error('[API Users GET by ID] Error:', error)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })

  } catch (error) {
    console.error('[API Users GET by ID] Unexpected error:', error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}

/**
 * PUT /api/users/[id]
 * Updates a user by ID (admin only)
 * 
 * @param request - JSON body with updated user data:
 *   {
 *     email?: string,
 *     name?: string,
 *     role?: string (valid restaurant role),
 *     password?: string (min 6 chars if provided)
 *   }
 * @param params - Route parameters containing user ID
 * @returns Updated user object or error
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { email, name, role, password } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Validate role if provided
    if (role && !['admin', 'owner', 'general_manager', 'assistant_manager', 'manager', 'shift_manager', 'chef', 'head_chef', 'sous_chef', 'line_cook', 'prep_cook', 'grill_cook', 'fry_cook', 'pastry_chef', 'dishwasher', 'kitchen_helper', 'server', 'waiter', 'waitress', 'host', 'bartender', 'barista', 'sommelier', 'busser', 'runner', 'cashier', 'delivery_driver', 'cleaner', 'security'].includes(role)) {
      return NextResponse.json(
        { error: 'Role must be a valid restaurant role' },
        { status: 400 }
      )
    }

    // Validate password if provided
    if (password && password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Validate email if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        )
      }
    }

    const supabase = await createClient()

    // Get user from token to verify admin role
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

    // Verify user is admin
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', decodedToken.userId)
      .single()

    if (userError || !currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Prevent admin from changing their own role to avoid locking themselves out
    if (id === decodedToken.userId && role && role !== 'admin') {
      return NextResponse.json(
        { error: 'Cannot change your own admin role' },
        { status: 400 }
      )
    }

    // Build update object
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (email) updateData.email = email.toLowerCase().trim()
    if (name) updateData.name = name.trim()
    if (role) updateData.role = role
    if (password) updateData.password_hash = await bcrypt.hash(password, 10)

    // Update user
    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select('id, email, name, role, created_at, updated_at')
      .single()

    if (error) {
      console.error('[API Users PUT] Error:', error)
      
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A user with this email already exists' },
          { status: 409 }
        )
      }
      
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('[API Users PUT] User updated:', { id: user.id, email: user.email, role: user.role })

    return NextResponse.json({
      message: 'User updated successfully',
      user
    })

  } catch (error) {
    console.error('[API Users PUT] Unexpected error:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

/**
 * DELETE /api/users/[id]
 * Deletes a user by ID (admin only)
 * 
 * @param params - Route parameters containing user ID
 * @returns Success message or error
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get user from token to verify admin role
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

    // Verify user is admin
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', decodedToken.userId)
      .single()

    if (userError || !currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Prevent admin from deleting themselves
    if (id === decodedToken.userId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    // Check if user owns any restaurants
    const { data: restaurants, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id, name')
      .eq('owner_id', id)

    if (!restaurantError && restaurants && restaurants.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete user who owns restaurants',
          details: `User owns ${restaurants.length} restaurant(s): ${restaurants.map(r => r.name).join(', ')}`
        },
        { status: 400 }
      )
    }

    // Delete user
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[API Users DELETE] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('[API Users DELETE] User deleted:', { id })

    return NextResponse.json({
      message: 'User deleted successfully'
    })

  } catch (error) {
    console.error('[API Users DELETE] Unexpected error:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
