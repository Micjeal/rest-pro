/**
 * Staff Performance API Route
 * GET /api/staff-performance?restaurantId=<uuid>&range=<range>&startDate=<date>&endDate=<date>
 * Returns staff performance data for reports and analytics
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')
    const range = searchParams.get('range') || 'week'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!restaurantId) {
      return NextResponse.json({ error: 'Restaurant ID is required' }, { status: 400 })
    }

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
          console.log('[Staff Performance API] Authenticated user via custom token:', user.email)
        } else {
          authError = userError
        }
      } catch (tokenError) {
        console.error('[Staff Performance API] Invalid token format:', tokenError)
        authError = new Error('Invalid token format')
      }
    } else {
      // Fallback to Supabase auth for backward compatibility
      const { data: { user: supabaseUser }, error: supabaseAuthError } = await supabase.auth.getUser()
      user = supabaseUser
      authError = supabaseAuthError
    }

    if (authError || !user) {
      console.log('[Staff Performance API] No authenticated user found')
      return NextResponse.json({ error: 'Unauthorized - Please login' }, { status: 401 })
    }

    // Calculate date range
    let dateFilter = ''
    const today = new Date()
    
    if (startDate && endDate) {
      // Custom date range
      dateFilter = `date.gte.${startDate}&date.lte.${endDate}`
    } else {
      // Predefined ranges
      let startDateFilter: Date
      switch (range) {
        case 'today':
          startDateFilter = new Date(today.toISOString().split('T')[0] + 'T00:00:00Z')
          dateFilter = `date.gte.${startDateFilter.toISOString().split('T')[0]}`
          break
        case 'week':
          startDateFilter = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          dateFilter = `date.gte.${startDateFilter.toISOString().split('T')[0]}`
          break
        case 'month':
          startDateFilter = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
          dateFilter = `date.gte.${startDateFilter.toISOString().split('T')[0]}`
          break
        case 'quarter':
          startDateFilter = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000)
          dateFilter = `date.gte.${startDateFilter.toISOString().split('T')[0]}`
          break
        case 'year':
          startDateFilter = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000)
          dateFilter = `date.gte.${startDateFilter.toISOString().split('T')[0]}`
          break
        default:
          startDateFilter = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          dateFilter = `date.gte.${startDateFilter.toISOString().split('T')[0]}`
      }
    }

    // Fetch staff performance data
    const { data: staffPerformanceData, error: performanceError } = await supabase
      .from('staff_performance')
      .select(`
        *,
        users!staff_performance_staff_id_fkey (
          id,
          name,
          email,
          role
        )
      `)
      .or(dateFilter)
      .order('date', { ascending: false })

    if (performanceError) {
      console.error('[Staff Performance API] Error fetching performance data:', performanceError)
      return NextResponse.json({ error: 'Failed to fetch staff performance data' }, { status: 500 })
    }

    // Fetch shift assignments
    const { data: shiftData, error: shiftError } = await supabase
      .from('shift_assignments')
      .select(`
        *,
        users!shift_assignments_staff_id_fkey (
          id,
          name,
          email,
          role
        )
      `)
      .or(dateFilter)
      .order('shift_date', { ascending: false })

    if (shiftError) {
      console.error('[Staff Performance API] Error fetching shift data:', shiftError)
      return NextResponse.json({ error: 'Failed to fetch shift data' }, { status: 500 })
    }

    // Fetch user activity
    const { data: activityData, error: activityError } = await supabase
      .from('user_activity')
      .select(`
        *,
        users!user_activity_user_id_fkey (
          id,
          name,
          email,
          role
        )
      `)
      .or(`created_at.gte.${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()}`)
      .order('created_at', { ascending: false })
      .limit(100)

    if (activityError) {
      console.error('[Staff Performance API] Error fetching activity data:', activityError)
      return NextResponse.json({ error: 'Failed to fetch activity data' }, { status: 500 })
    }

    // Process and aggregate performance data by staff member
    const staffMap = new Map()

    staffPerformanceData.forEach((performance: any) => {
      const staffId = performance.staff_id
      const staffInfo = performance.users

      if (!staffMap.has(staffId)) {
        staffMap.set(staffId, {
          staffId,
          name: staffInfo?.name || 'Unknown',
          email: staffInfo?.email || '',
          role: staffInfo?.role || 'unknown',
          totalOrders: 0,
          totalRevenue: 0,
          totalPreparationTime: 0,
          averagePreparationTime: 0,
          efficiencyScore: 0,
          daysWorked: 0,
          ordersCompleted: 0,
          ordersCancelled: 0,
          averageOrderValue: 0,
          totalHoursWorked: 0,
          performanceData: []
        })
      }

      const staffData = staffMap.get(staffId)
      staffData.totalOrders += performance.orders_completed || 0
      staffData.totalRevenue += performance.revenue_generated || 0
      staffData.totalPreparationTime += performance.total_preparation_time || 0
      staffData.ordersCompleted += performance.orders_completed || 0
      staffData.ordersCancelled += performance.orders_cancelled || 0
      staffData.totalHoursWorked += performance.hours_worked || 0
      staffData.daysWorked += 1
      staffData.performanceData.push(performance)
    })

    // Calculate averages and scores
    staffMap.forEach((staffData) => {
      staffData.averagePreparationTime = staffData.daysWorked > 0 ? 
        (staffData.totalPreparationTime / staffData.daysWorked).toFixed(2) : 0
      staffData.averageOrderValue = staffData.totalOrders > 0 ? 
        (staffData.totalRevenue / staffData.totalOrders).toFixed(2) : 0
      staffData.efficiencyScore = staffData.performanceData.reduce((sum: number, perf: any) => 
        sum + (perf.efficiency_score || 0), 0) / staffData.performanceData.length || 0
    })

    // Convert to array and sort by performance
    const staffPerformanceArray = Array.from(staffMap.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)

    // Process shift data
    const shiftMap = new Map()
    shiftData.forEach((shift: any) => {
      const staffId = shift.staff_id
      if (!shiftMap.has(staffId)) {
        shiftMap.set(staffId, {
          staffId,
          name: shift.users?.name || 'Unknown',
          totalShifts: 0,
          completedShifts: 0,
          scheduledShifts: 0,
          cancelledShifts: 0,
          shiftData: []
        })
      }
      const shiftInfo = shiftMap.get(staffId)
      shiftInfo.totalShifts += 1
      if (shift.status === 'completed') shiftInfo.completedShifts += 1
      if (shift.status === 'scheduled') shiftInfo.scheduledShifts += 1
      if (shift.status === 'cancelled') shiftInfo.cancelledShifts += 1
      shiftInfo.shiftData.push(shift)
    })

    const shiftArray = Array.from(shiftMap.values())

    // Process activity data
    const activityByType = new Map()
    activityData.forEach((activity: any) => {
      const type = activity.activity_type
      if (!activityByType.has(type)) {
        activityByType.set(type, 0)
      }
      activityByType.set(type, activityByType.get(type) + 1)
    })

    const activityArray = Array.from(activityByType.entries()).map(([type, count]) => ({
      type,
      count
    }))

    const performanceData = {
      staffPerformance: staffPerformanceArray,
      shiftAssignments: shiftArray,
      userActivity: activityArray,
      summary: {
        totalStaff: staffPerformanceArray.length,
        activeStaff: staffPerformanceArray.filter(s => s.daysWorked > 0).length,
        totalOrders: staffPerformanceArray.reduce((sum, s) => sum + s.totalOrders, 0),
        totalRevenue: staffPerformanceArray.reduce((sum, s) => sum + s.totalRevenue, 0),
        averageEfficiency: staffPerformanceArray.length > 0 ? 
          staffPerformanceArray.reduce((sum, s) => sum + s.efficiencyScore, 0) / staffPerformanceArray.length : 0,
        totalShifts: shiftArray.reduce((sum, s) => sum + s.totalShifts, 0),
        completedShifts: shiftArray.reduce((sum, s) => sum + s.completedShifts, 0)
      }
    }

    return NextResponse.json(performanceData)
  } catch (error) {
    console.error('[Staff Performance API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
