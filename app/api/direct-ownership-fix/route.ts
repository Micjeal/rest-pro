/**
 * @fileoverview Direct Ownership Fix API Route
 * Directly updates restaurant ownership using service client
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Service role client to bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const serviceClient = supabaseUrl && supabaseServiceKey 
  ? createSupabaseClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

export async function POST(request: NextRequest) {
  try {
    console.log('[Direct] Updating restaurant ownership directly...')

    // Use service client to bypass RLS completely
    const client = serviceClient
    
    if (!client) {
      return NextResponse.json({ error: 'Service client not available' }, { status: 500 })
    }

    // Get current user ID from the logs we saw earlier
    const userId = 'ce20cc6f-ba39-4578-a2aa-3b7eac5f0635'
    const restaurantId = '972b16d6-d3e1-4638-8ca8-1c3f04119696'
    
    console.log('[Direct] Updating restaurant:', restaurantId, 'to owner:', userId)

    // Update the restaurant ownership
    const { data: restaurant, error: updateError } = await client
      .from('restaurants')
      .update({ owner_id: userId })
      .eq('id', restaurantId)
      .select()
      .single()

    if (updateError) {
      console.error('[Direct] Error updating restaurant:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    console.log('[Direct] Restaurant ownership updated successfully')

    return NextResponse.json({
      message: 'Restaurant ownership updated successfully',
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        newOwnerId: userId
      },
      success: true
    })

  } catch (error) {
    console.error('[Direct] Unexpected error:', error)
    return NextResponse.json({ error: 'Failed to update restaurant ownership' }, { status: 500 })
  }
}
