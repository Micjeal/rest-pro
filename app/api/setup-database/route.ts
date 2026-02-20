/**
 * @fileoverview Database Setup API Route
 * Creates the users table and inserts sample data
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    console.log('[Setup] Starting database setup...')

    // Hash the password for sample users
    const passwordHash = await bcrypt.hash('demo123', 10)

    // Insert sample users using upsert
    const { data: insertedUsers, error: insertUsersError } = await supabase
      .from('users')
      .upsert([
        {
          email: 'admin@restaurant.com',
          password_hash: passwordHash,
          name: 'Restaurant Admin',
          role: 'admin'
        },
        {
          email: 'manager@restaurant.com',
          password_hash: passwordHash,
          name: 'Restaurant Manager',
          role: 'manager'
        },
        {
          email: 'cashier@restaurant.com',
          password_hash: passwordHash,
          name: 'Restaurant Cashier',
          role: 'cashier'
        }
      ], {
        onConflict: 'email'
      })
      .select()

    if (insertUsersError) {
      console.error('[Setup] Error inserting users:', insertUsersError)
      
      // If table doesn't exist, we'll get a specific error
      if (insertUsersError.message.includes('relation "users" does not exist')) {
        return NextResponse.json({
          error: 'Users table does not exist. Please run the SQL script manually in Supabase dashboard.',
          sqlNeeded: true
        }, { status: 400 })
      }
      
      return NextResponse.json(
        { error: insertUsersError.message },
        { status: 500 }
      )
    }

    console.log('[Setup] Sample users created successfully')

    return NextResponse.json({
      message: 'Database setup completed successfully',
      users: ['admin@restaurant.com', 'manager@restaurant.com', 'cashier@restaurant.com'],
      insertedUsers
    })

  } catch (error) {
    console.error('[Setup] Database setup error:', error)
    return NextResponse.json(
      { error: 'Failed to setup database' },
      { status: 500 }
    )
  }
}
