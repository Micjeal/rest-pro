/**
 * @fileoverview Fix Restaurant Ownership API Route
 * Updates restaurant ownership using service client
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
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
    console.log('[Fix] Updating restaurant ownership with service client...')

    // Use service client to bypass RLS
    const client = serviceClient
    
    if (!client) {
      return NextResponse.json({ error: 'Service client not available' }, { status: 500 })
    }

    // Get current user ID from regular client
    const supabase = await createClient()
    const authHeader = request.headers.get('authorization')
    let userId = null
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7)
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
        userId = decoded.userId
        console.log('[Fix] Current user ID:', userId)
      } catch (error) {
        console.error('[Fix] Invalid token format:', error)
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Update the specific restaurant to be owned by current user
    const restaurantId = '972b16d6-d3e1-4638-8ca8-1c3f04119696'
    
    const { data: restaurant, error: updateError } = await client
      .from('restaurants')
      .update({ owner_id: userId })
      .eq('id', restaurantId)
      .select()
      .single()

    if (updateError) {
      console.error('[Fix] Error updating restaurant:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    console.log('[Fix] Restaurant ownership updated successfully')

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
    console.error('[Fix] Unexpected error:', error)
    return NextResponse.json({ error: 'Failed to update restaurant ownership' }, { status: 500 })
  }
}
