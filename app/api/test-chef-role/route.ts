import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Test if we can create a chef user by attempting to insert one
    const testChefUser = {
      email: 'test-chef@example.com',
      name: 'Test Chef',
      role: 'chef',
      password_hash: 'test123'
    }
    
    const { data, error } = await supabase
      .from('users')
      .insert(testChefUser)
      .select()
    
    if (error) {
      // If there's a constraint error, we need to update the database
      if (error.message.includes('CHECK constraint') || error.message.includes('role')) {
        return NextResponse.json({
          error: 'Database constraint needs updating',
          message: 'Please run this SQL in your Supabase SQL editor:',
          sql: `
            ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
            ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'manager', 'cashier', 'chef'));
          `,
          needsManualUpdate: true
        }, { status: 400 })
      }
      
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Clean up the test user
    if (data && data.length > 0) {
      await supabase
        .from('users')
        .delete()
        .eq('id', data[0].id)
    }
    
    return NextResponse.json({
      message: 'Chef role is supported in database',
      success: true
    })
    
  } catch (error) {
    console.error('Error testing chef role:', error)
    return NextResponse.json({ 
      error: 'Failed to test chef role',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
