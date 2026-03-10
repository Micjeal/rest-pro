/**
 * Reports API Route
 * GET /api/reports - Fetch all reports
 * GET /api/reports?id=<id> - Fetch specific report
 * POST /api/reports - Create new report
 * DELETE /api/reports?id=<id> - Delete report
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SupabaseClient } from '@supabase/supabase-js'

// Create a service client that bypasses RLS
const createServiceClient = (): SupabaseClient => {
  return new SupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export interface Report {
  id: string
  title: string
  description?: string
  type: 'monthly' | 'weekly' | 'daily' | 'custom'
  date: string
  created_at: string
  updated_at: string
  restaurant_id?: string
  status: 'draft' | 'completed' | 'archived'
  data?: any // Report data (JSON)
  file_url?: string // URL to generated PDF/Excel file
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const reportId = searchParams.get('id')
    const restaurantId = searchParams.get('restaurantId')
    const limit = parseInt(searchParams.get('limit') || '10')
    const type = searchParams.get('type')

    console.log('[Reports API] Fetching reports:', { reportId, restaurantId, limit, type })

    // Test database connection and table existence
    try {
      // First test basic connection
      const { data: testData, error: testError } = await supabase
        .from('restaurants')
        .select('id')
        .limit(1)
      
      if (testError) {
        console.error('[Reports API] Database connection test failed:', testError)
        return NextResponse.json(
          { error: 'Database connection failed', details: testError.message },
          { status: 500 }
        )
      }
      
      // Test if reports table exists
      const { data: tableTest, error: tableError } = await supabase
        .from('reports')
        .select('id')
        .limit(1)
      
      if (tableError && tableError.code === '42P01') {
        console.log('[Reports API] Reports table does not exist')
        return NextResponse.json({
          error: 'Reports table not found',
          details: 'The reports table has not been created yet. Please run the setup script.',
          setup_required: true,
          setup_url: '/api/setup-reports'
        }, { status: 400 })
      }
      
      console.log('[Reports API] Database connection OK')
    } catch (dbTestError) {
      console.error('[Reports API] Database test error:', dbTestError)
      return NextResponse.json(
        { error: 'Database test failed', details: dbTestError instanceof Error ? dbTestError.message : 'Unknown error' },
        { status: 500 }
      )
    }

    if (reportId) {
      // Fetch specific report
      const { data: report, error } = await supabase
        .from('reports')
        .select('*')
        .eq('id', reportId)
        .single()

      if (error) {
        console.error('[Reports API] Error fetching report:', error)
        return NextResponse.json(
          { error: 'Report not found', details: error.message },
          { status: 404 }
        )
      }

      return NextResponse.json({ report })
    } else {
      // Fetch reports with filters using service client to bypass RLS
      try {
        const serviceSupabase = createServiceClient()
        
        let query = serviceSupabase
          .from('reports')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit)

        if (restaurantId) {
          query = query.eq('restaurant_id', restaurantId)
        }

        if (type) {
          query = query.eq('type', type)
        }

        console.log('[Reports API] Executing query with service client...')
        const { data: reports, error } = await query

        if (error) {
          console.error('[Reports API] Error with service client query:', error)
          return NextResponse.json(
            { error: 'Failed to fetch reports', details: error.message },
            { status: 500 }
          )
        }

        console.log('[Reports API] Service client query successful:', reports?.length || 0)
        return NextResponse.json({ reports: reports || [] })
      } catch (queryError) {
        console.error('[Reports API] Query exception:', queryError)
        return NextResponse.json(
          { error: 'Query failed', details: queryError instanceof Error ? queryError.message : 'Unknown error' },
          { status: 500 }
        )
      }
    }
  } catch (error) {
    console.error('[Reports API] Unexpected error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    console.log('[Reports API] Creating report:', body)

    const { title, description, type, date, restaurant_id, data } = body

    if (!title || !type || !date) {
      return NextResponse.json(
        { error: 'Missing required fields: title, type, date' },
        { status: 400 }
      )
    }

    const reportData = {
      title,
      description,
      type,
      date,
      restaurant_id,
      data,
      status: 'draft' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: report, error } = await supabase
      .from('reports')
      .insert(reportData)
      .select()
      .single()

    if (error) {
      console.error('[Reports API] Error creating report:', error)
      return NextResponse.json(
        { error: 'Failed to create report', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ report }, { status: 201 })
  } catch (error) {
    console.error('[Reports API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const reportId = searchParams.get('id')

    if (!reportId) {
      return NextResponse.json(
        { error: 'Report ID is required' },
        { status: 400 }
      )
    }

    console.log('[Reports API] Deleting report:', reportId)

    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', reportId)

    if (error) {
      console.error('[Reports API] Error deleting report:', error)
      return NextResponse.json(
        { error: 'Failed to delete report', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Reports API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
