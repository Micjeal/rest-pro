/**
 * @fileoverview Simple Restaurants API Route
 * Basic restaurant API without complex RLS for quick fix
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

    if (authError || !user) {
      console.log('[API] No authenticated user found')
      return NextResponse.json({ error: 'Unauthorized - Please login' }, { status: 401 })
    }

    console.log('[API] Fetching restaurants for user:', user.id)

    // For now, return all restaurants for any authenticated user
    // In the future, you might want to implement role-based filtering
    const { data: restaurants, error } = await supabase
      .from('restaurants')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[API] Database error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('[API] Found restaurants:', restaurants?.length || 0)

    return NextResponse.json(restaurants || [])
  } catch (error) {
    console.error('[API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    if (authError || !user) {
      console.log('[API] No authenticated user found')
      return NextResponse.json({ error: 'Unauthorized - Please login' }, { status: 401 })
    }

    const body = await request.json()

    const { data, error } = await supabase
      .from('restaurants')
      .insert([{ ...body, owner_id: user.id }])
      .select()

    if (error) {
      console.error('[API] POST restaurant error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error('[API] POST restaurant parse error:', error)
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
