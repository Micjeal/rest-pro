'use client'

import { SidebarNavigation } from '@/components/pos/sidebar-navigation'
import { RestaurantsList } from '@/components/restaurants-list'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, Users, ShoppingCart, DollarSign, Plus, Activity, Store } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRestaurants } from '@/hooks/use-restaurants'

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
    todayRevenue: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  
  // Use real data from hooks
  const { restaurants, isLoading: restaurantsLoading } = useRestaurants()

  useEffect(() => {
    console.log('[Dashboard] Page loaded - displaying all restaurants')
    loadDashboardStats()
  }, [restaurants])

  const loadDashboardStats = async () => {
    try {
      setIsLoading(true)
      
      // Get real statistics from APIs
      const [ordersResponse, usersResponse] = await Promise.all([
        fetch('/api/orders/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        }),
        fetch('/api/auth/users/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        })
      ])

      let ordersStats = { totalOrders: 0, totalRevenue: 0, todayOrders: 0, todayRevenue: 0 }
      let usersStats = { activeUsers: 0 }

      if (ordersResponse.ok) {
        ordersStats = await ordersResponse.json()
      }

      if (usersResponse.ok) {
        usersStats = await usersResponse.json()
      }

      const realStats = {
        totalRestaurants: restaurants.length,
        totalOrders: ordersStats.totalOrders || 0,
        totalRevenue: ordersStats.totalRevenue || 0,
        activeUsers: usersStats.activeUsers || 0,
        todayOrders: ordersStats.todayOrders || 0,
        todayRevenue: ordersStats.todayRevenue || 0
      }
      
      setStats(realStats)
    } catch (error) {
      console.error('[Dashboard] Error loading stats:', error)
      // Fallback to basic stats if APIs fail
      setStats({
        totalRestaurants: restaurants.length,
        totalOrders: 0,
        totalRevenue: 0,
        activeUsers: 0,
        todayOrders: 0,
        todayRevenue: 0
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex">
      <SidebarNavigation />
      <main id="main-content" className="flex-1 ml-64 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen transition-all duration-300 dark:bg-slate-900 dark:from-slate-900 dark:to-slate-800">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage all your restaurants from here</p>
          </div>

          {/* Statistics Cards - Modern Design */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Restaurants */}
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-100">Total Restaurants</CardTitle>
                <Store className="h-5 w-5 text-blue-200" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalRestaurants}</div>
                <p className="text-xs text-blue-200 mt-1">Active locations</p>
              </CardContent>
            </Card>

            {/* Total Orders */}
            <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 border-0 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-emerald-100">Total Orders</CardTitle>
                <ShoppingCart className="h-5 w-5 text-emerald-200" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalOrders.toLocaleString()}</div>
                <p className="text-xs text-emerald-200 mt-1">All time orders</p>
              </CardContent>
            </Card>

            {/* Total Revenue */}
            <Card className="bg-gradient-to-br from-amber-500 to-orange-600 border-0 text-white shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-amber-100">Total Revenue</CardTitle>
                <DollarSign className="h-5 w-5 text-amber-200" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-amber-200 mt-1">All time revenue</p>
              </CardContent>
            </Card>

            {/* Active Users */}
            <Card className="bg-gradient-to-br from-violet-500 to-purple-600 border-0 text-white shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-violet-100">Active Users</CardTitle>
                <Users className="h-5 w-5 text-violet-200" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.activeUsers}</div>
                <p className="text-xs text-violet-200 mt-1">Current active users</p>
              </CardContent>
            </Card>
          </div>

          {/* Today's Stats - Modern Design */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Today's Orders</CardTitle>
                <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                  <Activity className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.todayOrders}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Orders placed today</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Today's Revenue</CardTitle>
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">${stats.todayRevenue.toLocaleString()}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Revenue generated today</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions - Modern Design */}
          <Card className="mb-8 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/pos">
                  <Button className="w-full h-20 flex flex-col items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 hover:-translate-y-0.5">
                    <ShoppingCart className="h-6 w-6 mb-2" />
                    <span className="text-sm font-medium">New Order</span>
                  </Button>
                </Link>
                <Link href="/dashboard/new-restaurant">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center border-2 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-200 hover:-translate-y-0.5">
                    <Plus className="h-6 w-6 mb-2 text-gray-600 dark:text-gray-300" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Add Restaurant</span>
                  </Button>
                </Link>
                <Link href="/reports">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center border-2 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-200 hover:-translate-y-0.5">
                    <TrendingUp className="h-6 w-6 mb-2 text-gray-600 dark:text-gray-300" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">View Reports</span>
                  </Button>
                </Link>
                <Link href="/inventory">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center border-2 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-200 hover:-translate-y-0.5">
                    <Activity className="h-6 w-6 mb-2 text-gray-600 dark:text-gray-300" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Manage Inventory</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Restaurants List */}
          <RestaurantsList />
        </div>
      </main>
    </div>
  )
}
