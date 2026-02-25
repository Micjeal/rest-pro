/**
 * Financial Tracking API Route
 * GET /api/financial-tracking?restaurantId=<uuid>&range=<range>&startDate=<date>&endDate=<date>
 * Returns financial data for profit and tax analysis
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
          console.log('[Financial Tracking API] Authenticated user via custom token:', user.email)
        } else {
          authError = userError
        }
      } catch (tokenError) {
        console.error('[Financial Tracking API] Invalid token format:', tokenError)
        authError = new Error('Invalid token format')
      }
    } else {
      // Fallback to Supabase auth for backward compatibility
      const { data: { user: supabaseUser }, error: supabaseAuthError } = await supabase.auth.getUser()
      user = supabaseUser
      authError = supabaseAuthError
    }

    if (authError || !user) {
      console.log('[Financial Tracking API] No authenticated user found')
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

    // Fetch financial tracking data
    const { data: financialData, error: financialError } = await supabase
      .from('financial_tracking')
      .select('*')
      .or(dateFilter)
      .order('date', { ascending: false })

    if (financialError) {
      console.error('[Financial Tracking API] Error fetching financial data:', financialError)
      return NextResponse.json({ error: 'Failed to fetch financial data' }, { status: 500 })
    }

    // Fetch menu items with cost data for profit calculations
    const { data: menuItemsData, error: menuItemsError } = await supabase
      .from('menu_items')
      .select('id, name, price, cost_price, tax_category, profit_margin')

    if (menuItemsError) {
      console.error('[Financial Tracking API] Error fetching menu items:', menuItemsError)
      return NextResponse.json({ error: 'Failed to fetch menu items data' }, { status: 500 })
    }

    // Fetch orders for additional profit calculations
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        total_amount,
        status,
        created_at,
        completed_at,
        order_items (
          menu_item_id,
          quantity,
          unit_price,
          subtotal,
          menu_items (
            cost_price,
            tax_category
          )
        )
      `)
      .or(dateFilter.includes('date') ? 
        `created_at.gte.${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()}` : 
        dateFilter.replace(/date\./g, 'created_at.'))
      .eq('status', 'completed')
      .order('created_at', { ascending: false })

    if (ordersError) {
      console.error('[Financial Tracking API] Error fetching orders:', ordersError)
      return NextResponse.json({ error: 'Failed to fetch orders data' }, { status: 500 })
    }

    // Process financial data
    const dailyFinancialMap = new Map()

    financialData.forEach((financial: any) => {
      dailyFinancialMap.set(financial.date, {
        date: financial.date,
        totalRevenue: financial.total_revenue || 0,
        totalCost: financial.total_cost || 0,
        grossProfit: financial.gross_profit || 0,
        netProfit: financial.net_profit || 0,
        taxCollected: financial.tax_collected || 0,
        profitMargin: financial.profit_margin || 0,
        orderCount: financial.order_count || 0,
        customerCount: financial.customer_count || 0
      })
    })

    // Calculate additional profit data from orders
    let totalCost = 0
    let totalRevenue = 0
    let totalTax = 0
    const categoryProfitMap = new Map()

    ordersData.forEach((order: any) => {
      const orderRevenue = parseFloat(order.total_amount) || 0
      totalRevenue += orderRevenue

      if (order.order_items) {
        order.order_items.forEach((item: any) => {
          const quantity = item.quantity || 0
          const unitPrice = parseFloat(item.unit_price) || 0
          const costPrice = parseFloat(item.menu_items?.cost_price) || 0
          const taxCategory = item.menu_items?.tax_category || 'standard'
          
          const itemCost = costPrice * quantity
          const itemRevenue = unitPrice * quantity
          const itemTax = itemRevenue * 0.18 // 18% tax rate
          
          totalCost += itemCost
          totalTax += itemTax

          // Track profit by category
          if (!categoryProfitMap.has(taxCategory)) {
            categoryProfitMap.set(taxCategory, {
              category: taxCategory,
              revenue: 0,
              cost: 0,
              profit: 0,
              tax: 0,
              itemCount: 0
            })
          }
          
          const categoryData = categoryProfitMap.get(taxCategory)
          categoryData.revenue += itemRevenue
          categoryData.cost += itemCost
          categoryData.profit += (itemRevenue - itemCost)
          categoryData.tax += itemTax
          categoryData.itemCount += quantity
        })
      }
    })

    const grossProfit = totalRevenue - totalCost
    const netProfit = grossProfit - totalTax
    const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0

    // Convert category map to array
    const categoryProfitArray = Array.from(categoryProfitMap.values())
      .map(cat => ({
        ...cat,
        profitMargin: cat.revenue > 0 ? (cat.profit / cat.revenue) * 100 : 0
      }))
      .sort((a, b) => b.profit - a.profit)

    // Calculate daily trends
    const dailyFinancialArray = Array.from(dailyFinancialMap.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Calculate profit trends
    const profitTrends = dailyFinancialArray.map((day, index) => {
      const prevDay = dailyFinancialArray[index + 1]
      const profitChange = prevDay ? day.grossProfit - prevDay.grossProfit : 0
      const profitChangePercent = prevDay && prevDay.grossProfit > 0 ? 
        (profitChange / prevDay.grossProfit) * 100 : 0
      
      return {
        ...day,
        profitChange,
        profitChangePercent
      }
    })

    // Calculate tax breakdown
    const taxBreakdown = [
      {
        type: 'Standard Tax (18%)',
        amount: totalTax * 0.8,
        percentage: 80
      },
      {
        type: 'Other Taxes',
        amount: totalTax * 0.2,
        percentage: 20
      }
    ]

    const financialTrackingData = {
      summary: {
        totalRevenue,
        totalCost,
        grossProfit,
        netProfit,
        totalTax,
        profitMargin,
        totalOrders: ordersData.length,
        averageOrderValue: ordersData.length > 0 ? totalRevenue / ordersData.length : 0
      },
      dailyData: profitTrends,
      categoryProfit: categoryProfitArray,
      taxBreakdown,
      menuItems: menuItemsData || [],
      trends: {
        revenueGrowth: dailyFinancialArray.length > 1 ? 
          ((dailyFinancialArray[0].totalRevenue - dailyFinancialArray[dailyFinancialArray.length - 1].totalRevenue) / 
           dailyFinancialArray[dailyFinancialArray.length - 1].totalRevenue) * 100 : 0,
        profitGrowth: dailyFinancialArray.length > 1 ? 
          ((dailyFinancialArray[0].grossProfit - dailyFinancialArray[dailyFinancialArray.length - 1].grossProfit) / 
           Math.abs(dailyFinancialArray[dailyFinancialArray.length - 1].grossProfit || 1)) * 100 : 0,
        averageDailyProfit: dailyFinancialArray.length > 0 ? 
          dailyFinancialArray.reduce((sum, day) => sum + day.grossProfit, 0) / dailyFinancialArray.length : 0
      }
    }

    return NextResponse.json(financialTrackingData)
  } catch (error) {
    console.error('[Financial Tracking API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
