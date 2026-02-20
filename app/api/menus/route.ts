/**
 * @fileoverview Menus API Route
 * Handles CRUD operations for restaurant menus
 * 
 * Query Parameters:
 * - restaurantId: UUID of the restaurant (required for GET)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/menus?restaurantId=<uuid>
 * Retrieves all menus for a specific restaurant
 * 
 * @param request - NextJS request with restaurantId query parameter
 * @returns JSON array of menus or error
 * 
 * Success Response (200):
 * [
 *   {
 *     id: "uuid",
 *     restaurant_id: "uuid",
 *     name: "Lunch Menu",
 *     description: "Available 11am-2pm",
 *     created_at: "2024-01-01T00:00:00Z",
 *     updated_at: "2024-01-01T00:00:00Z"
 *   }
 * ]
 * 
 * Error Responses:
 * - 400: Missing restaurantId or database error
 */
export async function GET(request: NextRequest) {
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
        console.log('[Menus API] Authenticated user via custom token:', user.email)
      } else {
        authError = userError
      }
    } catch (tokenError) {
      console.error('[Menus API] Invalid token format:', tokenError)
      authError = new Error('Invalid token format')
    }
  } else {
    // Fallback to Supabase auth for backward compatibility
    const { data: { user: supabaseUser }, error: supabaseAuthError } = await supabase.auth.getUser()
    user = supabaseUser
    authError = supabaseAuthError
  }

  if (authError || !user) {
    console.log('[Menus API] No authenticated user found')
    return NextResponse.json({ error: 'Unauthorized - Please login' }, { status: 401 })
  }

  const restaurantId = request.nextUrl.searchParams.get('restaurantId')

  if (!restaurantId) {
    return NextResponse.json({ error: 'Restaurant ID required' }, { status: 400 })
  }

  const { data: menus, error } = await supabase
    .from('menus')
    .select('*')
    .eq('restaurant_id', restaurantId)

  if (error) {
    console.error('[API] GET menus error:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(menus)
}

/**
 * POST /api/menus
 * Creates a new menu for a restaurant
 * 
 * @param request - NextJS request with JSON body:
 *   {
 *     restaurant_id: string (uuid, required),
 *     name: string (required),
 *     description?: string
 *   }
 * 
 * @returns Created menu object (201) or error
 * 
 * Success Response (201):
 * {
 *   id: "uuid",
 *   restaurant_id: "uuid",
 *   name: "Lunch Menu",
 *   description: "Available 11am-2pm",
 *   created_at: "2024-01-01T00:00:00Z",
 *   updated_at: "2024-01-01T00:00:00Z"
 * }
 * 
 * Error Responses:
 * - 400: Invalid data or database error
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  try {
    const body = await request.json()

    const { data, error } = await supabase
      .from('menus')
      .insert([body])
      .select()

    if (error) {
      console.error('[API] POST menu error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error('[API] POST menu parse error:', error)
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
