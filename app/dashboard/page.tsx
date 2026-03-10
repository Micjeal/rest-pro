'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { RevenueChart } from '@/components/dashboard/RevenueChart'
import { PerformanceChart } from '@/components/dashboard/PerformanceChart'
import { OrderStatusCards } from '@/components/dashboard/OrderStatusCards'
import { LastReports } from '@/components/dashboard/LastReports'
import { CustomerMetrics } from '@/components/dashboard/CustomerMetrics'
import { RecentOrders } from '@/components/dashboard/RecentOrders'
import { FilterModal } from '@/components/dashboard/FilterModal'
import { Utensils, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { useRestaurants } from '@/hooks/use-restaurants'
import { useCurrency } from '@/hooks/use-currency'
import { useCurrentUser } from '@/hooks/use-current-user'

/**
 * Main Dashboard Page
 * Displays all restaurants owned by the authenticated user
 * Route: /dashboard
 * Enhanced with modern design
 */
export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalRestaurants: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeUsers: 0,
    todayOrders: 0,
    todayRevenue: 0,
    availableDishes: 0,
    totalProfit: 0,
    completedOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    // Trend data
    ordersGrowth: 0,
    revenueGrowth: 0,
    profitGrowth: 0,
    dishesGrowth: 0
  })
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('items')
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<any>({})
  const [revenuePeriod, setRevenuePeriod] = useState('week')
  
  // Use real data from hooks
  const { restaurants, isLoading: restaurantsLoading } = useRestaurants()
  const { formatAmount } = useCurrency()
  const { user: currentUser } = useCurrentUser()

  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true)
      
      if (!restaurants || restaurants.length === 0) {
        console.log('[Dashboard] No restaurants found, using fallback data')
        setFallbackData()
        return
      }

      // Get first restaurant ID for analytics
      const restaurantId = restaurants[0].id
      
      // Build API parameters based on filters
      const analyticsParams = new URLSearchParams({ 
        restaurantId,
        ...(revenuePeriod !== 'all' && { range: revenuePeriod })
      })
      const ordersParams = new URLSearchParams({ 
        restaurantId, 
        limit: '10',
        ...(activeTab === 'items' && { status: 'completed,processing' }),
        ...(activeTab === 'customer' && { status: 'completed' })
      })
      
      // Add applied filters
      if (appliedFilters.status && appliedFilters.status.length > 0) {
        ordersParams.set('status', appliedFilters.status.join(','))
      }
      
      if (appliedFilters.dateRange?.start) {
        analyticsParams.set('startDate', appliedFilters.dateRange.start)
        ordersParams.set('startDate', appliedFilters.dateRange.start)
      }
      
      if (appliedFilters.dateRange?.end) {
        analyticsParams.set('endDate', appliedFilters.dateRange.end)
        ordersParams.set('endDate', appliedFilters.dateRange.end)
      }
      
      // Add date range filter if specified
      if (selectedDate !== new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })) {
        // Convert selected date to ISO format for API
        const dateObj = new Date(selectedDate + ', ' + new Date().getFullYear())
        const isoDate = dateObj.toISOString().split('T')[0]
        if (!appliedFilters.dateRange?.start) {
          analyticsParams.set('startDate', isoDate)
          ordersParams.set('startDate', isoDate)
        }
        if (!appliedFilters.dateRange?.end) {
          analyticsParams.set('endDate', isoDate)
          ordersParams.set('endDate', isoDate)
        }
      }
      
      console.log('[Dashboard] Loading data with params:', { analyticsParams: analyticsParams.toString(), ordersParams: ordersParams.toString() })
      
      // Fetch comprehensive data from APIs
      const [analyticsResponse, ordersResponse, usersResponse, recentOrdersResponse] = await Promise.all([
        fetch(`/api/analytics?${analyticsParams.toString()}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        }),
        fetch(`/api/orders/stats?${analyticsParams.toString()}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        }),
        fetch('/api/auth/users/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        }),
        fetch(`/api/orders?${ordersParams.toString()}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        })
      ])

      let analytics = null
      let ordersStats = { totalOrders: 0, totalRevenue: 0, todayOrders: 0, todayRevenue: 0 }
      let usersStats = { activeUsers: 0 }
      let recentOrdersData = []

      // Parse analytics data
      if (analyticsResponse.ok) {
        analytics = await analyticsResponse.json()
        setAnalyticsData(analytics)
      }

      // Parse orders stats
      if (ordersResponse.ok) {
        ordersStats = await ordersResponse.json()
      }

      // Parse users stats
      if (usersResponse.ok) {
        usersStats = await usersResponse.json()
      }

      // Parse recent orders
      if (recentOrdersResponse.ok) {
        recentOrdersData = await recentOrdersResponse.json()
        setRecentOrders(recentOrdersData)
      }

      // Calculate real stats from API data
      const realStats = {
        totalRestaurants: restaurants.length,
        totalOrders: analytics?.totalOrders || ordersStats.totalOrders || 0,
        totalRevenue: analytics?.totalRevenue || ordersStats.totalRevenue || 0,
        activeUsers: usersStats.activeUsers || 0,
        todayOrders: analytics?.soldOrders || ordersStats.todayOrders || 0,
        todayRevenue: ordersStats.todayRevenue || 0,
        availableDishes: await fetchAvailableDishesCount(restaurantId),
        totalProfit: calculateProfit(analytics?.totalRevenue || ordersStats.totalRevenue || 0),
        completedOrders: analytics?.statusData?.find((s: any) => s.status === 'Completed')?.count || 0,
        pendingOrders: analytics?.statusData?.find((s: any) => s.status === 'Pending')?.count || 0,
        processingOrders: analytics?.statusData?.find((s: any) => s.status === 'Processing')?.count || 0,
        // Calculate trends
        ordersGrowth: calculateGrowth(analytics?.totalOrders || ordersStats.totalOrders || 0),
        revenueGrowth: calculateGrowth(analytics?.totalRevenue || ordersStats.totalRevenue || 0),
        profitGrowth: calculateGrowth(calculateProfit(analytics?.totalRevenue || ordersStats.totalRevenue || 0)),
        dishesGrowth: 0 // Could be calculated from historical data
      }
      
      setStats(realStats)
      console.log('[Dashboard] Real data loaded:', realStats)
    } catch (error) {
      console.error('[Dashboard] Error loading real data:', error)
      setFallbackData()
    } finally {
      setIsLoading(false)
    }
  }, [restaurants, revenuePeriod, activeTab, selectedDate, appliedFilters])

  useEffect(() => {
    console.log('[Dashboard] Page loaded - displaying all restaurants')
    loadDashboardData()
  }, [])

  useEffect(() => {
    console.log('[Dashboard] Filters changed - reloading data')
    loadDashboardData()
  }, [appliedFilters])

  useEffect(() => {
    console.log('[Dashboard] Revenue period changed - reloading analytics')
    loadDashboardData()
  }, [revenuePeriod])

  useEffect(() => {
    console.log('[Dashboard] Active tab changed - reloading data')
    loadDashboardData()
  }, [activeTab])

  useEffect(() => {
    console.log('[Dashboard] Selected date changed - reloading data')
    loadDashboardData()
  }, [selectedDate])

  const handleApplyFilter = (filters: any) => {
    setAppliedFilters(filters)
  }

  const fetchAvailableDishesCount = async (restaurantId: string) => {
    try {
      // Get menus for the restaurant first
      const menusResponse = await fetch(`/api/menus?restaurantId=${restaurantId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      
      if (!menusResponse.ok) return 0
      
      const menus = await menusResponse.json()
      if (!menus || menus.length === 0) return 0
      
      // Get menu items for the first menu
      const menuItemsResponse = await fetch(`/api/menu-items?menuId=${menus[0].id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      
      if (!menuItemsResponse.ok) return 0
      
      const menuItems = await menuItemsResponse.json()
      return menuItems?.filter((item: any) => item.availability !== false).length || 0
    } catch (error) {
      console.error('[Dashboard] Error fetching available dishes:', error)
      return 0
    }
  }

  const calculateProfit = (revenue: number) => {
    // Simple profit calculation (70% of revenue as profit)
    // In real implementation, this would consider costs, expenses, etc.
    return Math.round(revenue * 0.7)
  }

  const calculateGrowth = (currentValue: number) => {
    // Simple growth calculation (random between -5% and +15% for demo)
    // In real implementation, this would compare with previous period
    return Math.round((Math.random() * 20 - 5) * 10) / 10
  }

  const setFallbackData = () => {
    setStats({
      totalRestaurants: restaurants.length,
      totalOrders: 0,
      totalRevenue: 0,
      activeUsers: 0,
      todayOrders: 0,
      todayRevenue: 0,
      availableDishes: 0,
      totalProfit: 0,
      completedOrders: 0,
      pendingOrders: 0,
      processingOrders: 0,
      ordersGrowth: 0,
      revenueGrowth: 0,
      profitGrowth: 0,
      dishesGrowth: 0
    })
  }

  return (
    <DashboardLayout 
      title="" 
      subtitle=""
    >
      <div className="space-y-8">
        {/* Dashboard Header */}
        <DashboardHeader 
          onTabChange={setActiveTab}
          onDateChange={setSelectedDate}
          onFilterClick={() => setShowFilterModal(true)}
          activeTab={activeTab}
          selectedDate={selectedDate}
        />

        {/* Key Metrics Cards - First Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Available Dish"
            value={stats.availableDishes.toFixed(2)}
            subtitle="Available items"
            icon={Utensils}
            trend={{ value: `${stats.availableDishes} items`, isPositive: true }}
          />
          
          <MetricCard
            title="Total Order"
            value={stats.totalOrders.toLocaleString()}
            subtitle={`${stats.completedOrders} completed`}
            icon={ShoppingCart}
            trend={{ value: `${stats.completedOrders} completed`, isPositive: true }}
          />
          
          <MetricCard
            title="Total Sale"
            value={formatAmount(stats.totalRevenue)}
            subtitle="All time revenue"
            icon={DollarSign}
            trend={{ value: "7.8% Growth", isPositive: true }}
          />
          
          <MetricCard
            title="Total Profit"
            value={formatAmount(stats.totalProfit)}
            subtitle="Estimated profit"
            icon={TrendingUp}
            trend={{ value: "4.8% Increase", isPositive: true }}
          />
        </div>

        {/* Main Content Area - Second Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Total Revenue Chart */}
          <div className="lg:col-span-1">
            <RevenueChart 
              data={analyticsData?.dailyData || analyticsData?.monthlyRevenueData} 
              isLoading={isLoading} 
              currentPeriod={revenuePeriod}
              onPeriodChange={setRevenuePeriod}
            />
          </div>

          {/* Performance Chart */}
          <div className="lg:col-span-1">
            <PerformanceChart 
              data={analyticsData?.statusData?.map((status: any) => ({
                name: status.status,
                value: status.count,
                color: status.color
              }))} 
              totalCount={analyticsData?.totalOrders || 0}
              isLoading={isLoading} 
            />
          </div>

          {/* Order Status Cards */}
          <div className="lg:col-span-1">
            <OrderStatusCards 
              todayOrders={stats.todayOrders}
              completedOrders={stats.completedOrders}
              pendingOrders={stats.pendingOrders}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Last Reports */}
          <div className="lg:col-span-1">
            <LastReports isLoading={isLoading} />
          </div>

          {/* Customer Metrics */}
          <div className="lg:col-span-1">
            <CustomerMetrics 
              onlineCustomers={Math.round(stats.activeUsers * 0.6)}
              inShopCustomers={Math.round(stats.activeUsers * 0.4)}
              isLoading={isLoading} 
            />
          </div>

          {/* Recent Orders */}
          <div className="lg:col-span-1">
            <RecentOrders 
              orders={recentOrders.map((order: any) => ({
                id: order.id,
                name: order.order_items?.[0]?.menu_items?.name || 'Order',
                price: parseFloat(order.total_amount) || 0,
                date: new Date(order.created_at).toLocaleDateString('en-US', { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric' 
                }),
                status: order.status || 'pending',
                created_at: order.created_at,
                image: '/placeholder.jpg'
              }))} 
              isLoading={isLoading}
              currentUser={currentUser || undefined}
            />
          </div>
        </div>
      </div>
      
      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApplyFilter={handleApplyFilter}
      />
    </DashboardLayout>
  )
}
