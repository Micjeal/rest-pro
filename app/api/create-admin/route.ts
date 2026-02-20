/**
 * @fileoverview Create Admin User API Route
 * Creates the admin user if it doesn't exist
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    console.log('[CreateAdmin] Creating admin user...')

    // Hash the password
    const passwordHash = await bcrypt.hash('demo123', 10)

    // Create admin user
    const { data: user, error } = await supabase
      .from('users')
      .upsert({
        email: 'admin@restaurant.com',
        password_hash: passwordHash,
        name: 'Restaurant Admin',
        role: 'admin'
      }, {
        onConflict: 'email'
      })
      .select()
      .single()

    if (error) {
      console.error('[CreateAdmin] Error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    console.log('[CreateAdmin] Admin user created:', user)

    return NextResponse.json({
      message: 'Admin user created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })

  } catch (error) {
    console.error('[CreateAdmin] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create admin user' },
      { status: 500 }
    )
  }
}
