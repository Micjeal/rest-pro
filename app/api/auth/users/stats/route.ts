/**
 * Users Stats API Route
 * GET /api/auth/users/stats
 * Returns user statistics for dashboard
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check for custom token in Authorization header
    const authHeader = request.headers.get('Authorization')
    let user = null
    let authError = null

    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7)
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
        
        // Validate user from database using decoded token
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, email, role')
          .eq('id', decoded.userId)
          .eq('email', decoded.email)
          .single()
        
        if (!userError && userData) {
          user = userData
          console.log('[Users Stats API] Authenticated user via custom token:', user.email)
        } else {
          authError = userError
        }
      } catch (tokenError) {
        console.error('[Users Stats API] Invalid token format:', tokenError)
        authError = new Error('Invalid token format')
      }
    } else {
      // Fallback to Supabase auth for backward compatibility
      const { data: { user: supabaseUser }, error: supabaseAuthError } = await supabase.auth.getUser()
      user = supabaseUser
      authError = supabaseAuthError
    }

    if (authError || !user) {
      console.log('[Users Stats API] No authenticated user found')
      return NextResponse.json({ error: 'Unauthorized - Please login' }, { status: 401 })
    }

    console.log('[Users Stats API] Fetching stats for user:', user.id)

    // Get active users count (users with recent activity)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    
    const { data: activeUsers, error: activeError } = await supabase
      .from('user_sessions')
      .select('user_id')
      .gte('last_activity', thirtyDaysAgo)

    // Get total users count
    const { data: totalUsers, error: totalError } = await supabase
      .from('users')
      .select('id')
      .eq('is_active', true)

    if (activeError || totalError) {
      console.error('[Users Stats API] Error fetching user stats:', { activeError, totalError })
      // Fallback to basic count if sessions table doesn't exist
      const activeCount = totalUsers?.length || 0
      return NextResponse.json({ activeUsers: activeCount })
    }

    // Count unique active users
    const uniqueActiveUsers = new Set(activeUsers?.map(u => u.user_id)).size

    const stats = {
      activeUsers: uniqueActiveUsers,
      totalUsers: totalUsers?.length || 0
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('[Users Stats API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
