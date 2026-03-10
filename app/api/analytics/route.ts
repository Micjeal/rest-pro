/**
 * Analytics API Route
 * GET /api/analytics?restaurantId=<uuid>&range=<range>&startDate=<date>&endDate=<date>
 * Returns analytics data for reports and charts
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Define semantic color schemes for better visual distinction
const PAYMENT_METHOD_COLORS: { [key: string]: string } = {
  'cash': '#10b981',      // Green for cash
  'card': '#3b82f6',      // Blue for cards
  'mobilemoney': '#f59e0b', // Orange for mobile money
  'mobile': '#f59e0b',     // Orange for mobile (alternative)
  'bank': '#8b5cf6',      // Purple for bank transfers
  'banktransfer': '#8b5cf6', // Purple for bank transfers
  'transfer': '#8b5cf6',   // Purple for transfers
  'online': '#ec4899',     // Pink for online payments
  'digital': '#ec4899',    // Pink for digital payments
  'other': '#6b7280'       // Gray for other methods
}

const CATEGORY_COLORS: { [key: string]: string } = {
  'food': '#f97316',        // Orange for food
  'beverage': '#06b6d4',     // Cyan for beverages
  'drinks': '#06b6d4',       // Cyan for drinks
  'dessert': '#ec4899',      // Pink for desserts
  'appetizer': '#8b5cf6',    // Purple for appetizers
  'starter': '#8b5cf6',      // Purple for starters
  'main': '#f97316',         // Orange for main courses
  'side': '#10b981',         // Green for side dishes
  'other': '#6b7280'         // Gray for other categories
}

const STATUS_COLORS: { [key: string]: string } = {
  'completed': '#10b981',    // Green for completed
  'paid': '#10b981',         // Green for paid
  'pending': '#f59e0b',      // Yellow for pending
  'processing': '#3b82f6',   // Blue for processing
  'cancelled': '#ef4444',     // Red for cancelled
  'refunded': '#6b7280',      // Gray for refunded
  'failed': '#ef4444',        // Red for failed
  'other': '#6b7280'          // Gray for other statuses
}

// Fallback color arrays for unmapped items
const FALLBACK_PAYMENT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316']
const FALLBACK_CATEGORY_COLORS = ['#f97316', '#06b6d4', '#ec4899', '#8b5cf6', '#10b981', '#ef4444', '#3b82f6', '#6b7280']
const FALLBACK_STATUS_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6b7280', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4']

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
          console.log('[Analytics API] Authenticated user via custom token:', user.email)
        } else {
          authError = userError
        }
      } catch (tokenError) {
        console.error('[Analytics API] Invalid token format:', tokenError)
        authError = new Error('Invalid token format')
      }
    } else {
      // Fallback to Supabase auth for backward compatibility
      const { data: { user: supabaseUser }, error: supabaseAuthError } = await supabase.auth.getUser()
      user = supabaseUser
      authError = supabaseAuthError
    }

    if (authError || !user) {
      console.log('[Analytics API] No authenticated user found')
      return NextResponse.json({ error: 'Unauthorized - Please login' }, { status: 401 })
    }

    // Calculate date range
    let dateFilter = ''
    const today = new Date()
    
    if (startDate && endDate) {
      // Custom date range
      dateFilter = `created_at.gte.${startDate}T00:00:00Z,created_at.lte.${endDate}T23:59:59Z`
    } else {
      // Predefined ranges
      let startDateFilter: Date
      switch (range) {
        case 'today':
          startDateFilter = new Date(today.toISOString().split('T')[0] + 'T00:00:00Z')
          dateFilter = `created_at.gte.${startDateFilter.toISOString()}`
          break
        case 'week':
          startDateFilter = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          dateFilter = `created_at.gte.${startDateFilter.toISOString()}`
          break
        case 'month':
          startDateFilter = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
          dateFilter = `created_at.gte.${startDateFilter.toISOString()}`
          break
        case 'quarter':
          startDateFilter = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000)
          dateFilter = `created_at.gte.${startDateFilter.toISOString()}`
          break
        case 'year':
          startDateFilter = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000)
          dateFilter = `created_at.gte.${startDateFilter.toISOString()}`
          break
        default:
          startDateFilter = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          dateFilter = `created_at.gte.${startDateFilter.toISOString()}`
      }
    }

    // Fetch all orders (not just completed) for status tracking
    const { data: allOrders, error: allOrdersError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          menu_item_id,
          quantity,
          unit_price,
          subtotal,
          menu_items (
            category,
            name
          )
        )
      `)
      .eq('restaurant_id', restaurantId)
      .or(dateFilter)
      .order('created_at', { ascending: true })

    // Process completed orders only for analytics
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          menu_item_id,
          quantity,
          unit_price,
          subtotal,
          menu_items (
            category,
            name
          )
        )
      `)
      .eq('restaurant_id', restaurantId)
      .eq('status', 'completed')
      .or(dateFilter)
      .order('created_at', { ascending: true })

    if (allOrdersError || ordersError) {
      console.error('[Analytics API] Error fetching orders:', allOrdersError || ordersError)
      return NextResponse.json({ error: 'Failed to fetch analytics data' }, { status: 500 })
    }

    // Get distinct payment methods from processed orders
    const distinctPaymentMethods = new Set(orders.map((order: any) => order.payment_method?.toLowerCase()).filter(Boolean))

    // Process daily data with enhanced tracking
    const dailyMap = new Map()
    const paymentMap = new Map()
    const categoryMap = new Map()
    const hourlyMap = new Map()
    const weeklyTrend = new Map()
    const monthlyRevenueMap = new Map()

    orders.forEach((order: any) => {
      const date = new Date(order.created_at)
      const dayKey = date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3)
      const hourKey = date.getHours()
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()))
      const weekKey = weekStart.toISOString().split('T')[0]
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' }).slice(0, 3)
      const yearKey = date.getFullYear()
      const monthYearKey = `${monthKey} ${yearKey}`

      // Daily sales and transactions
      if (!dailyMap.has(dayKey)) {
        dailyMap.set(dayKey, { sales: 0, transactions: 0, orders: [] })
      }
      const dayData = dailyMap.get(dayKey)
      const orderAmount = parseFloat(order.total_amount) || 0
      // Ensure amounts are in UGX (no decimal conversion needed for UGX)
      dayData.sales += orderAmount
      dayData.transactions += 1
      dayData.orders.push(order)

      // Hourly tracking
      if (!hourlyMap.has(hourKey)) {
        hourlyMap.set(hourKey, { sales: 0, transactions: 0 })
      }
      const hourData = hourlyMap.get(hourKey)
      hourData.sales += orderAmount
      hourData.transactions += 1

      // Weekly trend
      if (!weeklyTrend.has(weekKey)) {
        weeklyTrend.set(weekKey, { sales: 0, transactions: 0 })
      }
      const weekData = weeklyTrend.get(weekKey)
      weekData.sales += orderAmount
      weekData.transactions += 1

      // Monthly revenue tracking
      if (!monthlyRevenueMap.has(monthYearKey)) {
        monthlyRevenueMap.set(monthYearKey, { revenue: 0, orders: 0 })
      }
      const monthData = monthlyRevenueMap.get(monthYearKey)
      monthData.revenue += orderAmount
      monthData.orders += 1

      // Payment method breakdown
      const paymentMethod = order.payment_method || 'unknown'
      if (!paymentMap.has(paymentMethod)) {
        paymentMap.set(paymentMethod, { value: 0, count: 0 })
      }
      const paymentData = paymentMap.get(paymentMethod)
      paymentData.value += orderAmount
      paymentData.count += 1

      // Category breakdown
      if (order.order_items) {
        order.order_items.forEach((item: any) => {
          if (item.menu_items && item.menu_items.category) {
            const category = item.menu_items.category
            if (!categoryMap.has(category)) {
              categoryMap.set(category, { value: 0, items: 0, avgPrice: 0 })
            }
            const categoryData = categoryMap.get(category)
            const itemSubtotal = parseFloat(item.subtotal) || 0
            categoryData.value += itemSubtotal
            categoryData.items += item.quantity
          }
        })
      }
    })

    // Calculate average prices for categories
    categoryMap.forEach((data, category) => {
      data.avgPrice = data.items > 0 ? data.value / data.items : 0
    })

    // Process order status tracking with revenue
    const statusMap = new Map()
    const statusRevenueMap = new Map()
    allOrders.forEach((order: any) => {
      const status = order.status || 'unknown'
      const revenue = parseFloat(order.total_amount) || 0
      
      if (!statusMap.has(status)) {
        statusMap.set(status, 0)
        statusRevenueMap.set(status, 0)
      }
      statusMap.set(status, statusMap.get(status) + 1)
      statusRevenueMap.set(status, statusRevenueMap.get(status) + revenue)
    })

    // Format data for charts
    const dailyData = Array.from(dailyMap.entries()).map(([date, data]) => ({
      date,
      sales: Math.round(data.sales * 100) / 100,
      transactions: data.transactions,
      avgOrderValue: data.transactions > 0 ? Math.round((data.sales / data.transactions) * 100) / 100 : 0
    }))

    const hourlyData = Array.from(hourlyMap.entries()).map(([hour, data]) => ({
      hour: `${hour}:00`,
      sales: Math.round(data.sales * 100) / 100,
      transactions: data.transactions
    })).sort((a, b) => parseInt(a.hour) - parseInt(b.hour))

    const weeklyData = Array.from(weeklyTrend.entries()).map(([week, data]) => ({
      week,
      sales: Math.round(data.sales * 100) / 100,
      transactions: data.transactions
    }))

    // Monthly revenue data for dashboard charts
    const monthlyRevenueData = Array.from(monthlyRevenueMap.entries()).map(([month, data]) => ({
      month: month.split(' ')[0], // Extract month name only
      revenue: Math.round(data.revenue * 100) / 100,
      orders: data.orders
    })).sort((a, b) => {
      const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month)
    })

    const paymentData = Array.from(paymentMap.entries())
      .filter(([method]) => distinctPaymentMethods.has(method.toLowerCase()))
      .map(([method, data], index) => {
        // Format payment method names properly
        const formattedMethod = method.toLowerCase() === 'mobilemoney' ? 'Mobile Money' :
                               method.toLowerCase() === 'cash' ? 'Cash' :
                               method.toLowerCase() === 'card' ? 'Card' :
                               method.charAt(0).toUpperCase() + method.slice(1)
        
        return {
          method: formattedMethod,
          value: Math.round(data.value * 100) / 100,
          count: data.count,
          avgTransaction: data.count > 0 ? Math.round((data.value / data.count) * 100) / 100 : 0,
          color: PAYMENT_METHOD_COLORS[method.toLowerCase()] || 
                  PAYMENT_METHOD_COLORS[method.toLowerCase().replace(/\s+/g, '')] ||
                  FALLBACK_PAYMENT_COLORS[index % FALLBACK_PAYMENT_COLORS.length]
        }
      })
      .sort((a, b) => b.count - a.count) // Sort by transaction count

    const categoryData = Array.from(categoryMap.entries()).map(([category, data], index) => ({
      category,
      value: Math.round(data.value * 100) / 100,
      items: data.items,
      avgPrice: Math.round(data.avgPrice * 100) / 100,
      color: CATEGORY_COLORS[category.toLowerCase()] || 
              CATEGORY_COLORS[category.toLowerCase().replace(/\s+/g, '')] ||
              FALLBACK_CATEGORY_COLORS[index % FALLBACK_CATEGORY_COLORS.length]
    }))

    const statusData = Array.from(statusMap.entries()).map(([status, count], index) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
      revenue: Math.round((statusRevenueMap.get(status) || 0) * 100) / 100,
      color: STATUS_COLORS[status.toLowerCase()] || 
              STATUS_COLORS[status.toLowerCase().replace(/\s+/g, '')] ||
              FALLBACK_STATUS_COLORS[index % FALLBACK_STATUS_COLORS.length]
    }))

    // Calculate additional revenue metrics - ensure UGX formatting (no decimals)
    const soldRevenue = Math.round((statusRevenueMap.get('completed') || 0))
    const totalOrderRevenue = Math.round(Array.from(statusRevenueMap.values()).reduce((sum: number, revenue: number) => sum + revenue, 0))
    const averageOrderValue = allOrders.length > 0 ? Math.round(totalOrderRevenue / allOrders.length) : 0

    const analyticsData = {
      dailyData,
      hourlyData,
      weeklyData,
      monthlyRevenueData,
      paymentData,
      categoryData,
      statusData,
      totalOrders: allOrders.length,
      soldOrders: orders.length,
      clearedOrders: allOrders.length,
      soldRevenue: soldRevenue,
      totalOrderRevenue: totalOrderRevenue,
      averageOrderValue: averageOrderValue,
      totalRevenue: Math.round(orders.reduce((sum: number, order: any) => sum + (parseFloat(order.total_amount) || 0), 0))
    }

    // Debug logging for KPICards empty issue
    console.log('[Analytics API] Full Response:', {
      dailyDataCount: dailyData.length,
      hourlyDataCount: hourlyData.length,
      weeklyDataCount: weeklyData.length,
      paymentDataCount: paymentData.length,
      categoryDataCount: categoryData.length,
      statusDataCount: statusData.length,
      totalOrders: allOrders.length,
      soldOrders: orders.length,
      totalRevenue: analyticsData.totalRevenue,
      averageOrderValue: analyticsData.averageOrderValue,
      sampleDailyData: dailyData.slice(0, 2),
      sampleOrders: orders.slice(0, 2)
    })

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error('[Analytics API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
