import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Test authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    console.log('[Debug Auth] User:', user)
    console.log('[Debug Auth] Auth Error:', authError)
    
    if (authError || !user) {
      return NextResponse.json({ 
        authenticated: false,
        error: authError?.message || 'No user found',
        user: null 
      })
    }
    
    return NextResponse.json({ 
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role || 'unknown'
      }
    })
    
  } catch (error) {
    console.error('[Debug Auth] Unexpected error:', error)
    return NextResponse.json({ 
      authenticated: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
