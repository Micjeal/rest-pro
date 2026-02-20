/**
 * @fileoverview Test Delete Summary API Route
 * Simple test without service client
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

    // Simple test - just get restaurant info
    const { data: restaurant, error } = await supabase
      .from('restaurants')
      .select('id, name')
      .eq('id', restaurantId)
      .single()

    if (error || !restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    return NextResponse.json({
      message: 'Delete summary test successful',
      restaurant: {
        id: restaurant.id,
        name: restaurant.name
      }
    })

  } catch (error) {
    console.error('[Test] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
