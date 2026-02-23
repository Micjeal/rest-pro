'use client'

import { useState } from 'react'
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
  const [filterTab, setFilterTab] = useState<FilterTab>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('orders')
  const { orders, isLoading, updateOrderStatus } = useKitchenOrders(restaurantId)

  const filteredOrders = orders.filter(order => {
    if (filterTab === 'all') return true
    return order.status === filterTab
  })

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
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md">
          <div className="bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-full h-32 w-32 flex items-center justify-center mx-auto mb-8 shadow-xl">
            <ChefHat className="h-16 w-16 text-orange-500 dark:text-orange-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No Restaurant Selected</h3>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">Please select a restaurant from the dropdown above to view and manage kitchen orders</p>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <span className="font-semibold">💡 Tip:</span> Selecting a restaurant will show all active orders for that location
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
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

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <Tabs defaultValue="all" value={filterTab} onValueChange={(value) => setFilterTab(value as FilterTab)}>
          <TabsList className="grid grid-cols-4 bg-white/90 dark:bg-slate-800/90 p-1 rounded-xl shadow-lg backdrop-blur-sm border border-gray-200 dark:border-slate-700">
            <TabsTrigger 
              value="all" 
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-100 data-[state=active]:to-gray-200 dark:data-[state=active]:from-slate-700 dark:data-[state=active]:to-slate-600 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white rounded-lg transition-all duration-300 hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              <Clock className="h-4 w-4" />
              <span className="font-medium">All</span>
              <span className="bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-full font-semibold">
                {orders.length}
              </span>
            </TabsTrigger>
            <TabsTrigger 
              value="pending" 
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-100 data-[state=active]:to-orange-100 dark:data-[state=active]:from-yellow-900/30 dark:data-[state=active]:to-orange-900/30 data-[state=active]:text-yellow-800 dark:data-[state=active]:text-yellow-200 rounded-lg transition-all duration-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
            >
              <Clock className="h-4 w-4" />
              <span className="font-medium">Pending</span>
              <span className="bg-gradient-to-r from-yellow-200 to-orange-200 dark:from-yellow-800 dark:to-orange-800 text-yellow-800 dark:text-yellow-200 text-xs px-2 py-1 rounded-full font-semibold animate-pulse">
                {getStatusCount('pending')}
              </span>
            </TabsTrigger>
            <TabsTrigger 
              value="preparing" 
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-100 data-[state=active]:to-indigo-100 dark:data-[state=active]:from-blue-900/30 dark:data-[state=active]:to-indigo-900/30 data-[state=active]:text-blue-800 dark:data-[state=active]:text-blue-200 rounded-lg transition-all duration-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <ChefHat className="h-4 w-4" />
              <span className="font-medium">Preparing</span>
              <span className="bg-gradient-to-r from-blue-200 to-indigo-200 dark:from-blue-800 dark:to-indigo-800 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full font-semibold">
                {getStatusCount('preparing')}
              </span>
            </TabsTrigger>
            <TabsTrigger 
              value="ready" 
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-100 data-[state=active]:to-emerald-100 dark:data-[state=active]:from-green-900/30 dark:data-[state=active]:to-emerald-900/30 data-[state=active]:text-green-800 dark:data-[state=active]:text-green-200 rounded-lg transition-all duration-300 hover:bg-green-50 dark:hover:bg-green-900/20"
            >
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">Ready</span>
              <span className="bg-gradient-to-r from-green-200 to-emerald-200 dark:from-green-800 dark:to-emerald-800 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-full font-semibold animate-pulse">
                {getStatusCount('ready')}
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-800 dark:to-slate-700 rounded-full h-32 w-32 flex items-center justify-center mx-auto mb-8 shadow-xl">
                <Clock className="h-16 w-16 text-gray-400 dark:text-gray-500" />
              </div>
              <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {filterTab === 'all' ? 'No Active Orders' : `No ${filterTab.charAt(0).toUpperCase() + filterTab.slice(1)} Orders`}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
              {filterTab === 'all' 
                ? 'The kitchen is all caught up! No orders currently in the system.'
                : `Great job! No orders currently in ${filterTab} status.`
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-700 dark:text-green-300">
                  <span className="font-semibold">✨ Kitchen Status:</span> All clear and ready for new orders
                </p>
              </div>
              {filterTab !== 'all' && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <span className="font-semibold">📊 View All:</span> Check the "All" tab to see complete order status
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {filteredOrders.map((order, index) => {
              const delayClass = index === 0 ? '' : `animate-delay-${Math.min(index * 100, 900)}`
              return (
                <div 
                  key={order.id} 
                  className={`animate-fade-in-up ${delayClass}`}
                >
                  <OrderCard
                    order={order}
                    onStatusUpdate={handleStatusUpdate}
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
