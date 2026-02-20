/**
 * @fileoverview Fix RLS Policies API Route
 * Updates RLS policies to allow proper user access
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    console.log('[FixRLS] Fixing RLS policies...')

    // Drop existing RLS policies for users table
    const policies = [
      'DROP POLICY IF EXISTS "Users can view their own profile" ON users;',
      'DROP POLICY IF EXISTS "Users can update their own profile" ON users;',
      'ALTER TABLE users DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE users ENABLE ROW LEVEL SECURITY;'
    ]

    const results = []

    for (const sql of policies) {
      const { error } = await supabase.rpc('exec_sql', { sql })
      results.push({ sql, error: error?.message })
    }

    // Create new RLS policies that allow login
    const newPolicies = [
      // Allow users to read their own profile
      `CREATE POLICY "Users can view their own profile"
       ON users FOR SELECT
       USING (id = current_setting('app.current_user_id', true)::UUID OR id IS NULL);`,
      
      // Allow users to update their own profile  
      `CREATE POLICY "Users can update their own profile"
       ON users FOR UPDATE
       USING (id = current_setting('app.current_user_id', true)::UUID);`,
       
      // Allow user insertion (for registration)
      `CREATE POLICY "Allow user registration"
       ON users FOR INSERT
       WITH CHECK (true);`
    ]

    for (const sql of newPolicies) {
      const { error } = await supabase.rpc('exec_sql', { sql })
      results.push({ sql: sql.substring(0, 50) + '...', error: error?.message })
    }

    // Test if we can now read users
    const { data: testUsers, error: testError } = await supabase
      .from('users')
      .select('id, email, name, role')
      .limit(5)

    return NextResponse.json({
      message: 'RLS policies updated',
      results,
      testUsers: testUsers || [],
      testError: testError?.message,
      canReadUsers: !testError
    })

  } catch (error) {
    console.error('[FixRLS] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fix RLS policies' },
      { status: 500 }
    )
  }
}
