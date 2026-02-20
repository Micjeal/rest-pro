/**
 * @fileoverview Setup Delete Procedure API Route
 * Creates the delete_restaurant_safely stored procedure
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    console.log('[Setup] Creating delete restaurant procedure...')

    // Read the SQL file
    const sqlPath = path.join(process.cwd(), 'database-plans', 'delete-restaurant-procedure.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')

    // Execute the SQL to create the procedure
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: sqlContent 
    })

    if (error) {
      console.error('[Setup] Error creating procedure:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('[Setup] Delete procedure created successfully')

    return NextResponse.json({
      message: 'Delete restaurant procedure created successfully',
      success: true
    })

  } catch (error) {
    console.error('[Setup] Unexpected error:', error)
    return NextResponse.json({ error: 'Failed to setup delete procedure' }, { status: 500 })
  }
}
