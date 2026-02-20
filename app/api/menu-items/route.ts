/**
 * @fileoverview Menu Items API Route
 * Handles CRUD operations for menu items
 * 
 * Query Parameters:
 * - menuId: UUID of the menu (required for GET)
 * - id: UUID of the menu item (required for DELETE)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/menu-items?menuId=<uuid>
 * Retrieves all items for a specific menu
 * 
 * @param request - NextJS request with menuId query parameter
 * @returns JSON array of menu items or error
 * 
 * Success Response (200):
 * [
 *   {
 *     id: "uuid",
 *     menu_id: "uuid",
 *     name: "Caesar Salad",
 *     description: "Fresh greens with parmesan",
 *     price: "12.99",
 *     availability: true,
 *     created_at: "2024-01-01T00:00:00Z",
 *     updated_at: "2024-01-01T00:00:00Z"
 *   }
 * ]
 * 
 * Error Responses:
 * - 400: Missing menuId or database error
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
        console.log('[Menu Items API] Authenticated user via custom token:', user.email)
      } else {
        authError = userError
      }
    } catch (tokenError) {
      console.error('[Menu Items API] Invalid token format:', tokenError)
      authError = new Error('Invalid token format')
    }
  } else {
    // Fallback to Supabase auth for backward compatibility
    const { data: { user: supabaseUser }, error: supabaseAuthError } = await supabase.auth.getUser()
    user = supabaseUser
    authError = supabaseAuthError
  }

  if (authError || !user) {
    console.log('[Menu Items API] No authenticated user found')
    return NextResponse.json({ error: 'Unauthorized - Please login' }, { status: 401 })
  }

  const menuId = request.nextUrl.searchParams.get('menuId')

  if (!menuId) {
    return NextResponse.json({ error: 'Menu ID required' }, { status: 400 })
  }

  const { data: items, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('menu_id', menuId)

  if (error) {
    console.error('[API] GET menu items error:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(items)
}

/**
 * POST /api/menu-items
 * Creates a new menu item
 * 
 * @param request - NextJS request with JSON body:
 *   {
 *     menu_id: string (uuid, required),
 *     name: string (required),
 *     description?: string,
 *     price: number (required),
 *     availability?: boolean
 *   }
 * 
 * @returns Created menu item object (201) or error
 * 
 * Success Response (201):
 * {
 *   id: "uuid",
 *   menu_id: "uuid",
 *   name: "Caesar Salad",
 *   description: "Fresh greens with parmesan",
 *   price: "12.99",
 *   availability: true,
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
      .from('menu_items')
      .insert([body])
      .select()

    if (error) {
      console.error('[API] POST menu item error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error('[API] POST menu item parse error:', error)
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

/**
 * PUT /api/menu-items
 * Updates an existing menu item
 * 
 * @param request - NextJS request with JSON body:
 *   {
 *     id: string (uuid, required),
 *     name?: string,
 *     description?: string,
 *     price?: number,
 *     availability?: boolean
 *   }
 * 
 * @returns Updated menu item object (200) or error
 * 
 * Success Response (200):
 * {
 *   id: "uuid",
 *   menu_id: "uuid",
 *   name: "Caesar Salad",
 *   description: "Updated description",
 *   price: "13.99",
 *   availability: true,
 *   created_at: "2024-01-01T00:00:00Z",
 *   updated_at: "2024-01-01T12:00:00Z"
 * }
 * 
 * Error Responses:
 * - 400: Invalid data or database error
 */
export async function PUT(request: NextRequest) {
  const supabase = await createClient()

  try {
    const { id, ...body } = await request.json()

    const { data, error } = await supabase
      .from('menu_items')
      .update(body)
      .eq('id', id)
      .select()

    if (error) {
      console.error('[API] PUT menu item error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error('[API] PUT menu item parse error:', error)
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

/**
 * DELETE /api/menu-items?id=<uuid>
 * Deletes a menu item
 * 
 * @param request - NextJS request with id query parameter
 * @returns Success message (200) or error
 * 
 * Success Response (200):
 * {
 *   success: true
 * }
 * 
 * Error Responses:
 * - 400: Missing id or database error
 */
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const id = request.nextUrl.searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Item ID required' }, { status: 400 })
  }

  const { error } = await supabase.from('menu_items').delete().eq('id', id)

  if (error) {
    console.error('[API] DELETE menu item error:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
