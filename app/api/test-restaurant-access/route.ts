/**
 * @fileoverview Test Restaurant Access API Route
 * Tests if user can access specific restaurant
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: restaurantId } = await params

    console.log('[Test] Testing access to restaurant:', restaurantId)

    // Test 1: Check if restaurant exists
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id, name, owner_id')
      .eq('id', restaurantId)
      .single()

    if (restaurantError || !restaurant) {
      return NextResponse.json({ 
        error: 'Restaurant not found',
        restaurantId 
      }, { status: 404 })
    }

    // Test 2: Check authentication
    const authHeader = request.headers.get('authorization')
    let userId = null
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7)
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
        userId = decoded.userId
        console.log('[Test] User ID from token:', userId)
      } catch (error) {
        console.error('[Test] Invalid token format:', error)
      }
    }

    console.log('[Test] Restaurant owner ID:', restaurant.owner_id)
    console.log('[Test] Current user ID:', userId)

    return NextResponse.json({
      message: 'Restaurant access test',
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        ownerId: restaurant.owner_id,
        userCanAccess: userId === restaurant.owner_id
      },
      auth: {
        hasToken: !!authHeader,
        userId: userId,
        isOwner: userId === restaurant.owner_id
      }
    })

  } catch (error) {
    console.error('[Test] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
