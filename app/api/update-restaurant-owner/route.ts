/**
 * @fileoverview Update Restaurant Owner API Route
 * Updates restaurant ownership to current user
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    console.log('[Update] Updating restaurant ownership...')

    // Get user ID from auth token
    const authHeader = request.headers.get('authorization')
    let userId = null
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7)
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
        userId = decoded.userId
        console.log('[Update] Current user ID:', userId)
      } catch (error) {
        console.error('[Update] Invalid token format:', error)
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Update the specific restaurant to be owned by current user
    const restaurantId = '972b16d6-d3e1-4638-8ca8-1c3f04119696'
    
    const { data: restaurant, error: updateError } = await supabase
      .from('restaurants')
      .update({ owner_id: userId })
      .eq('id', restaurantId)
      .select()
      .single()

    if (updateError) {
      console.error('[Update] Error updating restaurant:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    console.log('[Update] Restaurant ownership updated successfully')

    return NextResponse.json({
      message: 'Restaurant ownership updated successfully',
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        newOwnerId: userId,
        previousOwnerId: restaurant.owner_id
      },
      success: true
    })

  } catch (error) {
    console.error('[Update] Unexpected error:', error)
    return NextResponse.json({ error: 'Failed to update restaurant ownership' }, { status: 500 })
  }
}
