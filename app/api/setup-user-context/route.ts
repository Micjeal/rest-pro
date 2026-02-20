/**
 * @fileoverview Setup User Context API Route
 * Creates the set_user_id function for RLS
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    console.log('[Setup] Creating user context function...')

    // Read the SQL file
    const sqlPath = path.join(process.cwd(), 'database-plans', 'create-user-context-function.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')

    // Execute the SQL to create the function
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: sqlContent 
    })

    if (error) {
      console.error('[Setup] Error creating user context function:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('[Setup] User context function created successfully')

    return NextResponse.json({
      message: 'User context function created successfully',
      success: true
    })

  } catch (error) {
    console.error('[Setup] Unexpected error:', error)
    return NextResponse.json({ error: 'Failed to setup user context function' }, { status: 500 })
  }
}
