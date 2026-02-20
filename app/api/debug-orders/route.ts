import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const restaurantId = request.nextUrl.searchParams.get('restaurantId')
    const statusParam = request.nextUrl.searchParams.get('status')

    console.log('[DEBUG] Kitchen orders API call:', {
      restaurantId,
      statusParam,
      hasRestaurantId: !!restaurantId,
      hasStatusParam: !!statusParam
    })

    if (!restaurantId) {
      return NextResponse.json({ 
        error: 'Restaurant ID required',
        debug: { restaurantId, statusParam }
      }, { status: 400 })
    }

    let query = supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false })

    if (statusParam) {
      const statuses = statusParam.split(',').map(status => status.trim())
      console.log('[DEBUG] Filtering by statuses:', statuses)
      query = query.in('status', statuses)
    }

    const { data: orders, error } = await query

    if (error) {
      console.error('[DEBUG] Database error:', error)
      return NextResponse.json({ 
        error: error.message,
        debug: { restaurantId, statusParam }
      }, { status: 400 })
    }

    console.log('[DEBUG] Orders found:', orders?.length || 0)

    return NextResponse.json({ 
      orders,
      debug: { 
        restaurantId, 
        statusParam, 
        count: orders?.length || 0 
      }
    })

  } catch (error) {
    console.error('[DEBUG] API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
