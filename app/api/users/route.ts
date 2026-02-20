/**
 * @fileoverview Users API Route
 * Handles CRUD operations for user management (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'

/**
 * GET /api/users
 * Lists all users with pagination and search (admin only)
 * 
 * Query Parameters:
 * - page: number (default: 1)
 * - limit: number (default: 10)
 * - search: string (optional, searches by name or email)
 * - role: string (optional, filter by role)
 * 
 * @returns Paginated list of users or error
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''

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

    // Build query
    let query = supabase
      .from('users')
      .select('id, email, name, role, created_at, updated_at', { count: 'exact' })

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    if (role) {
      query = query.eq('role', role)
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to).order('created_at', { ascending: false })

    const { data: users, error, count } = await query

    if (error) {
      console.error('[API Users GET] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      users: users || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('[API Users GET] Unexpected error:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

/**
 * POST /api/users
 * Creates a new user (admin only)
 * 
 * @param request - JSON body with user data:
 *   {
 *     email: string (required),
 *     name: string (required),
 *     role: string (required, valid restaurant role),
 *     password: string (required, min 6 chars)
 *   }
 * 
 * @returns Created user object or error
 */
export async function POST(request: NextRequest) {
  try {
    const { email, name, role, password } = await request.json()

    // Validation
    if (!email || !name || !role || !password) {
      return NextResponse.json(
        { error: 'Email, name, role, and password are required' },
        { status: 400 }
      )
    }

    if (!['admin', 'owner', 'general_manager', 'assistant_manager', 'manager', 'shift_manager', 'chef', 'head_chef', 'sous_chef', 'line_cook', 'prep_cook', 'grill_cook', 'fry_cook', 'pastry_chef', 'dishwasher', 'kitchen_helper', 'server', 'waiter', 'waitress', 'host', 'bartender', 'barista', 'sommelier', 'busser', 'runner', 'cashier', 'delivery_driver', 'cleaner', 'security'].includes(role)) {
      return NextResponse.json(
        { error: 'Role must be a valid restaurant role' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
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

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase().trim(),
        name: name.trim(),
        role,
        password_hash: passwordHash
      })
      .select('id, email, name, role, created_at, updated_at')
      .single()

    if (error) {
      console.error('[API Users POST] Error:', error)
      
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A user with this email already exists' },
          { status: 409 }
        )
      }
      
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('[API Users POST] User created:', { id: user.id, email: user.email, role: user.role })

    return NextResponse.json({
      message: 'User created successfully',
      user
    }, { status: 201 })

  } catch (error) {
    console.error('[API Users POST] Unexpected error:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}
