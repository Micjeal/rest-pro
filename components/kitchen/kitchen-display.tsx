'use client'

import { useState, useEffect, useMemo } from 'react'
import { useKitchenOrders } from '@/hooks/use-kitchen-orders'
import { OrderCard } from './order-card'
import { AdvancedFilters } from './advanced-filters'
import { BulkActions } from './bulk-actions'
import { StaffAssignment } from './staff-assignment'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Clock, ChefHat, CheckCircle, Filter, Users, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRestaurants } from '@/hooks/use-restaurants'
import '@/styles/kitchen.css'

type FilterTab = 'all' | 'pending' | 'preparing' | 'ready'

type ViewMode = 'orders' | 'filters' | 'staff' | 'analytics'

export function KitchenDisplay({ restaurantId }: { restaurantId?: string }) {
  console.log('[Kitchen Display] Component mounting with restaurantId:', restaurantId)
  
  const [filterTab, setFilterTab] = useState<FilterTab>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('orders')
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const { orders, isLoading, updateOrderStatus } = useKitchenOrders(restaurantId)
  const [filteredOrders, setFilteredOrders] = useState<any[]>([])

  console.log('[Kitchen Display] Initial state - orders:', orders.length, 'isLoading:', isLoading)

  // Apply tab filtering to the filtered orders
  const displayOrders = useMemo(() => {
    const baseOrders = filteredOrders.length > 0 ? filteredOrders : orders
    if (filterTab === 'all') return baseOrders
    return baseOrders.filter(order => order.status === filterTab)
  }, [filteredOrders, orders, filterTab])

  // Debug logging
  useEffect(() => {
    console.log('[Kitchen Display] Orders:', orders.length)
    console.log('[Kitchen Display] Filtered orders:', filteredOrders.length)
    console.log('[Kitchen Display] Display orders:', displayOrders.length)
    console.log('[Kitchen Display] Filter tab:', filterTab)
    console.log('[Kitchen Display] Is loading:', isLoading)
    console.log('[Kitchen Display] RestaurantId:', restaurantId)
  }, [orders, filteredOrders, displayOrders, filterTab, isLoading, restaurantId])

  console.log('[Kitchen Display] About to render - checking conditions...')

  const handleStatusUpdate = async (orderId: string, currentStatus: string, targetStatus?: string) => {
    const status = targetStatus || (
      currentStatus === 'pending' ? 'preparing' : 
      currentStatus === 'preparing' ? 'ready' : 'completed'
    )
    
    const success = await updateOrderStatus(orderId, status)
    if (!success) {
      console.error('Failed to update order status')
    }
  }

  const handleBulkStatusUpdate = async (orderIds: string[], status: string) => {
    for (const orderId of orderIds) {
      await handleStatusUpdate(orderId, orders.find(o => o.id === orderId)?.status || 'pending', status)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500'
      case 'preparing': return 'bg-blue-500'
      case 'ready': return 'bg-green-500'
      case 'completed': return 'bg-gray-500'
      default: return 'bg-gray-400'
    }
  }

  const getStatusCount = (status: string) => {
    return orders.filter(order => order.status === status).length
  }

  if (!restaurantId) {
    console.log('[Kitchen Display] No restaurantId - showing loading state')
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md">
          <div className="bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-full h-32 w-32 flex items-center justify-center mx-auto mb-8 shadow-xl">
            <ChefHat className="h-16 w-16 text-orange-500 dark:text-orange-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Loading Restaurant...</h3>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">Please wait while we set up your kitchen display</p>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <span className="font-semibold">💡 Tip:</span> The system is automatically selecting your restaurant
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    console.log('[Kitchen Display] Still loading - showing loading state')
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 dark:border-orange-800 border-t-orange-500 mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <ChefHat className="h-8 w-8 text-orange-500 animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Loading Kitchen Orders</h3>
          <p className="text-gray-600 dark:text-gray-400">Fetching latest orders from the kitchen...</p>
        </div>
      </div>
    )
  }

  console.log('[Kitchen Display] Past loading states - rendering main layout')

  return (
    <div className="h-full flex flex-col">
      {/* Kitchen Statistics Header */}
      <div className="mb-6 bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-slate-700">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {getStatusCount('pending')}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {getStatusCount('preparing')}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Preparing</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {getStatusCount('ready')}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Ready</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              {getStatusCount('completed')}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
          </div>
        </div>
      </div>

      {/* Column-Based Order Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* Pending Orders Column */}
        <div className="flex flex-col bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border-2 border-yellow-200 dark:border-yellow-800">
          <div className="p-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-t-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Pending Orders
              </h3>
              <Badge variant="secondary" className="bg-white/20 text-white">
                {getStatusCount('pending')}
              </Badge>
            </div>
            <p className="text-sm opacity-90 mt-1">Orders awaiting preparation</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {orders.filter(o => o.status === 'pending').length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-yellow-400 mx-auto mb-3 opacity-50" />
                <p className="text-yellow-700 dark:text-yellow-300 font-medium">No pending orders</p>
                <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">New orders will appear here</p>
              </div>
            ) : (
              orders.filter(o => o.status === 'pending').map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusUpdate={handleStatusUpdate}
                />
              ))
            )}
          </div>
        </div>

        {/* Preparing Orders Column */}
        <div className="flex flex-col bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
          <div className="p-4 bg-gradient-to-r from-blue-400 to-indigo-400 text-white rounded-t-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <ChefHat className="h-5 w-5" />
                Preparing
              </h3>
              <Badge variant="secondary" className="bg-white/20 text-white">
                {getStatusCount('preparing')}
              </Badge>
            </div>
            <p className="text-sm opacity-90 mt-1">Orders currently being prepared</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {orders.filter(o => o.status === 'preparing').length === 0 ? (
              <div className="text-center py-8">
                <ChefHat className="h-12 w-12 text-blue-400 mx-auto mb-3 opacity-50" />
                <p className="text-blue-700 dark:text-blue-300 font-medium">No orders preparing</p>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">Orders move here when preparation starts</p>
              </div>
            ) : (
              orders.filter(o => o.status === 'preparing').map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusUpdate={handleStatusUpdate}
                />
              ))
            )}
          </div>
        </div>

        {/* Ready Orders Column */}
        <div className="flex flex-col bg-green-50 dark:bg-green-900/20 rounded-xl border-2 border-green-200 dark:border-green-800">
          <div className="p-4 bg-gradient-to-r from-green-400 to-emerald-400 text-white rounded-t-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Ready for Pickup
              </h3>
              <Badge variant="secondary" className="bg-white/20 text-white">
                {getStatusCount('ready')}
              </Badge>
            </div>
            <p className="text-sm opacity-90 mt-1">Orders ready for customers</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {orders.filter(o => o.status === 'ready').length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3 opacity-50" />
                <p className="text-green-700 dark:text-green-300 font-medium">No orders ready</p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">Completed orders appear here</p>
              </div>
            ) : (
              orders.filter(o => o.status === 'ready').map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusUpdate={handleStatusUpdate}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
