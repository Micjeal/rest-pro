import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Run the migration to add chef role
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;'
    })
    
    if (dropError) {
      console.error('Error dropping constraint:', dropError)
    }
    
    const { error: addError } = await supabase.rpc('exec_sql', {
      sql: "ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'manager', 'cashier', 'chef'));"
    })
    
    if (addError) {
      console.error('Error adding constraint:', addError)
      return NextResponse.json({ error: addError.message }, { status: 500 })
    }
    
    return NextResponse.json({ 
      message: 'Successfully added chef role to database constraint',
      success: true 
    })
    
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({ 
      error: 'Failed to run migration',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
