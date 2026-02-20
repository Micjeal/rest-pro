/**
 * @fileoverview Check Environment Variables API Route
 * Debug environment variables for troubleshooting
 */

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      NODE_ENV: process.env.NODE_ENV
    }

    console.log('[Env Check] Environment variables:', envVars)

    return NextResponse.json({
      message: 'Environment variables check',
      envVars,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL
    })

  } catch (error) {
    console.error('[Env Check] Error:', error)
    return NextResponse.json({ error: 'Failed to check environment' }, { status: 500 })
  }
}
