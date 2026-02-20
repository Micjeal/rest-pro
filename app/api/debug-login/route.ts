/**
 * @fileoverview Debug Login API Route
 * Bypasses RLS to check user authentication
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    console.log('[DebugLogin] Attempting login for:', email)

    const supabase = await createClient()

    // Temporarily disable RLS for this query
    await supabase.rpc('set_config', { 
      config_name: 'row_security', 
      config_value: 'off' 
    })

    // Find user without RLS restrictions
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, role, password_hash')
      .eq('email', email)
      .single()

    console.log('[DebugLogin] User query result:', { user: user ? 'found' : 'not found', error: error?.message })

    if (error || !user) {
      return NextResponse.json({ 
        error: 'User not found',
        details: error?.message,
        email 
      }, { status: 401 })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash)
    console.log('[DebugLogin] Password valid:', isPasswordValid)

    if (!isPasswordValid) {
      return NextResponse.json({ 
        error: 'Invalid password',
        email 
      }, { status: 401 })
    }

    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })

  } catch (error) {
    console.error('[DebugLogin] Error:', error)
    return NextResponse.json(
      { error: 'Debug login failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
