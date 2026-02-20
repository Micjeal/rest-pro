/**
 * @fileoverview Authentication Login API Route
 * Handles user login with email and password using database users
 * Returns user data and auth token
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'

/**
 * POST /api/auth/login
 * Authenticates user with email and password
 * 
 * @param request - NextJS request with JSON body:
 *   {
 *     email: string (required),
 *     password: string (required)
 *   }
 * 
 * @returns User object with role and auth token (200) or error
 * 
 * Success Response (200):
 * {
 *   user: {
 *     id: "uuid",
 *     email: "user@example.com",
 *     name: "John Doe",
 *     role: "cashier" | "manager" | "admin"
 *   },
 *   token: "jwt-token-here"
 * }
 * 
 * Error Responses:
 * - 400: Invalid credentials or missing fields
 * - 401: Unauthorized
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validation
    if (!email || !password) {
      console.error('[API] Login: Missing email or password')
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Bypass RLS for login by temporarily disabling it
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, role, password_hash')
      .eq('email', email)
      .single()

    console.log('[API] Login: User query result:', { 
      found: !!user, 
      error: error?.message,
      email 
    })

    if (error || !user) {
      console.error('[API] Login: User not found for', email, 'Error:', error?.message)
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash)

    if (!isPasswordValid) {
      console.error('[API] Login: Invalid password for', email)
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Generate simple token (in production, use JWT)
    const token = Buffer.from(JSON.stringify({ 
      userId: user.id, 
      email: user.email,
      role: user.role 
    })).toString('base64')

    console.log('[API] Login successful for:', email, 'role:', user.role)

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[API] Login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
