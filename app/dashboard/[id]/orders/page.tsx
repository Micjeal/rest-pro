'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useRestaurants } from '@/hooks/use-restaurants'
import { useOrders } from '@/hooks/use-orders'
import { useCurrency } from '@/hooks/use-currency'
import { Plus, Eye, Phone, DollarSign, User, Search, Filter, Calendar, Clock, TrendingUp, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { OrderManagementPanel } from '@/components/dashboard/OrderManagementPanel'
import { useCurrentUser } from '@/hooks/use-current-user'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  preparing: 'bg-purple-100 text-purple-800 border-purple-200',
  ready: 'bg-green-100 text-green-800 border-green-200',
  completed: 'bg-gray-100 text-gray-800 border-gray-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
}

const statusIcons: Record<string, string> = {
  pending: '⏳',
  confirmed: '✅',
  preparing: '👨‍🍳',
  ready: '🍽️',
  completed: '✅',
  cancelled: '❌',
}

export default function OrdersPage() {
  const params = useParams()
  const urlRestaurantId = params.id as string
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('created_at')
  const [showManagementPanel, setShowManagementPanel] = useState(false)
  
  // Use real data from hooks
  const { restaurants, isLoading: restaurantsLoading } = useRestaurants()
  const { orders, isLoading: ordersLoading, error, mutate } = useOrders(selectedRestaurant || urlRestaurantId)
  const { formatAmount, currency, getCurrencyCode } = useCurrency({ restaurantId: selectedRestaurant || urlRestaurantId })
  const { user: currentUser } = useCurrentUser()
  
  // Debug logging for currency
  console.log('[OrdersPage] Currency Info:', {
    restaurantId: selectedRestaurant || urlRestaurantId,
    currency: currency?.code,
    currencySymbol: currency?.symbol,
    getCurrencyCode: getCurrencyCode(),
    formatAmount: formatAmount(1000)
  })
  
  // Check if user has admin/manager role
  const canManageOrders = currentUser && ['admin', 'manager'].includes(currentUser.role)
  
  // Add a function to trigger data refresh
  const triggerDataRefresh = () => {
    // Use SWR mutate to refresh the orders data
    mutate()
  }
  
  // Set default restaurant when data loads, or use URL restaurant ID
  useEffect(() => {
    if (restaurants.length > 0 && !selectedRestaurant) {
      // If URL has a valid restaurant ID that exists in our restaurants, use it
      const urlRestaurantExists = restaurants.find((r: any) => r.id === urlRestaurantId)
      setSelectedRestaurant(urlRestaurantExists ? urlRestaurantId : restaurants[0].id)
    }
  }, [restaurants, selectedRestaurant, urlRestaurantId])

  const restaurantId = selectedRestaurant || urlRestaurantId
  const isLoading = restaurantsLoading || ordersLoading

  // Ensure orders is an array and apply filters
  const ordersArray = Array.isArray(orders) ? orders : []
  
  // Filter and sort orders
  const filteredOrders = ordersArray
    .filter(order => {
      // Search filter
      if (searchTerm && !order.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      
      // Status filter
      if (statusFilter !== 'all' && order.status !== statusFilter) {
        return false
      }
      
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'created_at':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'total_amount':
          return b.total_amount - a.total_amount
        case 'customer_name':
          return a.customer_name.localeCompare(b.customer_name)
        default:
          return 0
      }
    })

  // Debug logging
  console.log('[OrdersPage] Data:', {
    totalOrders: ordersArray.length,
    filteredOrders: filteredOrders.length,
    searchTerm,
    statusFilter,
    sortBy,
    currentUser: currentUser?.role,
    canManageOrders
  })

  // Calculate stats
  const stats = {
    total: filteredOrders.length,
    pending: filteredOrders.filter(o => o.status === 'pending').length,
    completed: filteredOrders.filter(o => o.status === 'completed').length,
    totalRevenue: filteredOrders.reduce((sum, order) => sum + order.total_amount, 0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 sm:px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Orders</h1>
                <p className="text-sm text-gray-600 mt-1">Manage your restaurant orders</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              {/* Restaurant Selector */}
              <Select value={selectedRestaurant || ''} onValueChange={setSelectedRestaurant} disabled={restaurantsLoading}>
                <SelectTrigger className="w-full sm:w-48 bg-white border-gray-300">
                  <SelectValue placeholder="Select restaurant" />
                </SelectTrigger>
                <SelectContent>
                  {restaurants.map((restaurant: any) => (
                    <SelectItem key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Manage Orders Button - only for admin/manager */}
              {canManageOrders && (
                <Button
                  onClick={() => {
                    console.log('[OrdersPage] Opening OrderManagementPanel with orders:', filteredOrders.length)
                    setShowManagementPanel(true)
                  }}
                  className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg transition-all duration-200"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Manage Orders</span>
                  <span className="sm:hidden">Manage</span>
                </Button>
              )}
              
              {/* New Order Button */}
              <Link href={`/pos`} className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg transition-all duration-200">
                  <Plus className="h-4 w-4 mr-2" />
                  New Order
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{stats.completed}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{formatAmount(stats.totalRevenue)}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters Section */}
      <div className="px-4 sm:px-6 pb-6">
        <Card className="bg-white border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by customer name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500"
                />
              </div>
              
              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-48 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="preparing">Preparing</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full lg:w-48 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Date</SelectItem>
                  <SelectItem value="total_amount">Amount</SelectItem>
                  <SelectItem value="customer_name">Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="px-4 sm:px-6 pb-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <Card className="bg-white border-0 shadow-md">
            <CardContent className="text-center py-12">
              <p className="text-red-500">Error loading orders: {error.message}</p>
            </CardContent>
          </Card>
        ) : filteredOrders.length === 0 ? (
          <Card className="bg-white border-0 shadow-md">
            <CardContent className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-400 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your filters or search terms' 
                    : 'Start creating orders to see them here'}
                </p>
                <Link href={`/pos`}>
                  <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Order
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredOrders.map((order: any) => (
              <Card key={order.id} className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {order.customer_name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 font-mono">#{order.id.slice(0, 8)}</p>
                    </div>
                    <Badge className={`shrink-0 px-3 py-1.5 font-semibold ${statusColors[order.status] || 'bg-gray-100 text-gray-800'} border border-current/20`}>
                      <span className="mr-1">{statusIcons[order.status]}</span>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {/* Order Amount - Prominent */}
                  <div className="text-center py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold text-blue-600">{formatAmount(order.total_amount)}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-gray-600 text-xs">Phone</p>
                        <p className="font-medium text-gray-900 truncate">{order.customer_phone || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-gray-600 text-xs">Date</p>
                        <p className="font-medium text-gray-900 truncate">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-gray-600 text-xs">Cashier</p>
                      <p className="font-medium text-gray-900 truncate">
                        {order.users ? `${order.users.name} (${order.users.role})` : order.cashier_name || 'Not assigned'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-gray-600 text-xs">Payment</p>
                      <p className="font-medium text-gray-900 truncate">{order.payment_method || 'Not specified'}</p>
                    </div>
                  </div>

                  {order.notes && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Notes</p>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg line-clamp-2">{order.notes}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Link href={`/dashboard/${restaurantId}/orders/${order.id}`} className="flex-1">
                      <Button size="sm" className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md transition-all duration-200">
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Order Management Panel */}
      {currentUser && (
        <OrderManagementPanel
          isOpen={showManagementPanel}
          onClose={() => setShowManagementPanel(false)}
          currentUser={currentUser}
          orders={filteredOrders}
          restaurantId={restaurantId}
          onRefresh={triggerDataRefresh}
        />
      )}
    </div>
  )
}
