/**
 * @fileoverview Check Database Tables API Route
 * Lists all tables in the database
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    console.log('[CheckTables] Checking database tables...')

    // Get all tables
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_schema')
      .eq('table_schema', 'public')
      .order('table_name')

    if (error) {
      console.error('[CheckTables] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Try to check if users table exists specifically
    const { data: usersTable, error: usersError } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    return NextResponse.json({
      message: 'Database tables retrieved',
      tables: tables || [],
      usersTableExists: !usersError,
      usersError: usersError?.message
    })

  } catch (error) {
    console.error('[CheckTables] Error:', error)
    return NextResponse.json(
      { error: 'Failed to check tables' },
      { status: 500 }
    )
  }
}
