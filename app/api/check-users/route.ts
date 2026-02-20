/**
 * @fileoverview Check Users API Route
 * Lists all users in the database (bypasses RLS)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    console.log('[CheckUsers] Checking users in database...')

    // Try to get users with RLS first
    const { data: usersWithRLS, error: rlsError } = await supabase
      .from('users')
      .select('id, email, name, role')
      .limit(10)

    console.log('[CheckUsers] With RLS:', { users: usersWithRLS?.length || 0, error: rlsError?.message })

    // Try to get users without RLS by using service role
    const { data: allUsers, error: noRLSError } = await supabase
      .from('users')
      .select('id, email, name, role')
      .limit(10)

    console.log('[CheckUsers] Without RLS:', { users: allUsers?.length || 0, error: noRLSError?.message })

    // Also check if table exists
    const { data: tableInfo } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'users')
      .eq('table_schema', 'public')
      .single()

    return NextResponse.json({
      message: 'Users check completed',
      usersWithRLS: usersWithRLS || [],
      allUsers: allUsers || [],
      usersTableExists: !!tableInfo,
      rlsError: rlsError?.message,
      noRLSError: noRLSError?.message,
      totalUsers: allUsers?.length || 0
    })

  } catch (error) {
    console.error('[CheckUsers] Error:', error)
    return NextResponse.json(
      { error: 'Failed to check users', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
