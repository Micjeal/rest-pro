'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRestaurants } from '@/hooks/use-restaurants'
import { useOrders } from '@/hooks/use-orders'
import { useCurrency } from '@/hooks/use-currency'
import { Plus, Eye, Phone, DollarSign, User } from 'lucide-react'
import Link from 'next/link'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  ready: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function OrdersPage() {
  const params = useParams()
  const urlRestaurantId = params.id as string
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null)
  
  // Use real data from hooks
  const { restaurants, isLoading: restaurantsLoading } = useRestaurants()
  const { orders, isLoading: ordersLoading, error } = useOrders(selectedRestaurant || urlRestaurantId)
  const { formatAmount } = useCurrency({ restaurantId: selectedRestaurant || urlRestaurantId })
  
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

  // Ensure orders is an array
  const ordersArray = Array.isArray(orders) ? orders : []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Orders</h1>
            <p className="text-sm text-gray-600 mt-1">Manage your restaurant orders</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Restaurant Selector */}
            <Select value={selectedRestaurant || ''} onValueChange={setSelectedRestaurant} disabled={restaurantsLoading}>
              <SelectTrigger className="w-full sm:w-48">
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
            
            {/* New Order Button */}
            <Link href={`/pos`}>
              <Button className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                New Order
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">Error loading orders: {error.message}</p>
          </div>
        ) : ordersArray.length === 0 ? (
          <Card className="bg-white border-gray-200">
            <CardContent className="text-center py-12">
              <p className="text-gray-500">No orders yet</p>
              <Link href={`/pos`}>
                <Button className="mt-4 bg-green-600 hover:bg-green-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Order
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-6">
            {ordersArray.map((order: any) => (
              <Card key={order.id} className="bg-white border-gray-200 hover:shadow-md transition-shadow">
                <CardHeader className="bg-gray-50 border-b border-gray-200 pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-semibold text-gray-900 truncate">{order.customer_name}</CardTitle>
                      <p className="text-sm text-gray-600">Order #{order.id.slice(0, 8)}</p>
                    </div>
                    <Badge className={`shrink-0 ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                      {order.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-gray-600 text-xs">Phone</p>
                        <p className="font-medium text-gray-900 truncate">{order.customer_phone || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-gray-600 text-xs">Total</p>
                        <p className="font-medium text-gray-900 truncate">{formatAmount(order.total_amount)}</p>
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
                      <Button size="sm" variant="outline" className="w-full text-xs h-10 touch-manipulation">
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
    </div>
  )
}
