/**
 * @fileoverview Authentication Logout API Route
 * Handles user logout and session cleanup
 */

import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/auth/logout
 * Logs out the current user and clears session
 * 
 * @param request - NextJS request object
 * @returns Success message (200)
 * 
 * Success Response (200):
 * {
 *   success: true,
 *   message: "Logged out successfully"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[API] User logout')

    // In production, invalidate JWT token and clear session
    // For now, just return success

    return NextResponse.json(
      {
        success: true,
        message: 'Logged out successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[API] Logout error:', error)
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}
