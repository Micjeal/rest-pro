'use client'

import { useState, useEffect } from 'react'
import { SidebarNavigation } from '@/components/pos/sidebar-navigation'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, Trash2, Package, TrendingDown, Clock, User, Phone, Mail, DollarSign, Volume2, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useRestaurants } from '@/hooks/use-restaurants'
import { useOrderDetails } from '@/hooks/use-order-details'
import { announceOrderReady } from '@/lib/text-to-speech'
import { useCurrency } from '@/hooks/use-currency'

interface OrderItem {
  id: string
  menu_item_id: string
  quantity: number
  unit_price: number
  subtotal: number
  menu_item?: {
    name: string
    description: string
    price: number
  }
}

interface Order {
  id: string
  restaurant_id: string
  customer_name: string
  customer_phone?: string
  customer_email?: string
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'
  total_amount: number
  notes?: string
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const restaurantId = params.id as string
  const orderId = params.orderId as string
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAnnouncing, setIsAnnouncing] = useState(false)
  
  // Use real data from hooks
  const { restaurants, isLoading: restaurantsLoading } = useRestaurants()
  const { order, isLoading: orderLoading } = useOrderDetails(orderId)
  const { formatAmount } = useCurrency({ restaurantId })
  
  // Set default restaurant when data loads
  useEffect(() => {
    if (restaurants.length > 0 && !selectedRestaurant) {
      const urlRestaurantExists = restaurants.find((r: any) => r.id === restaurantId)
      setSelectedRestaurant(urlRestaurantExists ? restaurantId : restaurants[0].id)
    }
  }, [restaurants, selectedRestaurant, restaurantId])
  
  // Stop loading when data is ready
  useEffect(() => {
    if (!restaurantsLoading && !orderLoading) {
      setLoading(false)
    }
  }, [restaurantsLoading, orderLoading])
  
  const handleUpdateStatus = async (newStatus: Order['status']) => {
    if (!order) return
    
    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (!response.ok) {
        throw new Error('Failed to update order status')
      }
      
      toast.success(`Order status updated to ${newStatus}`)
    } catch (error) {
      console.error('[Order] Error updating status:', error)
      toast.error('Failed to update status')
    }
  }
  
  const handleAnnounceOrder = async () => {
    if (isAnnouncing || !order) return;
    
    setIsAnnouncing(true);
    try {
      const orderNumber = order.id.slice(0, 8);
      await announceOrderReady(orderNumber, order.customer_name);
      toast.success('Order announcement completed');
    } catch (error) {
      console.error('Error announcing order:', error);
      toast.error('Failed to announce order');
    } finally {
      setIsAnnouncing(false);
    }
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'preparing':
        return 'bg-purple-100 text-purple-800'
      case 'ready':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  if (loading || restaurantsLoading || orderLoading) {
    return (
      <div className="flex">
        <SidebarNavigation />
        <main id="main-content" className="flex-1 ml-64 bg-gray-50 min-h-screen transition-all duration-300">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading order details...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }
  
  if (!order) {
    return (
      <div className="flex">
        <SidebarNavigation />
        <main id="main-content" className="flex-1 ml-64 bg-gray-50 min-h-screen transition-all duration-300">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
              <p className="text-gray-600 mb-6">The order you're looking for doesn't exist.</p>
              <Button onClick={() => router.push(`/dashboard/${selectedRestaurant}/orders`)}>
                Back to Orders
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }
  
  return (
    <div className="flex">
      <SidebarNavigation />
      <main id="main-content" className="flex-1 ml-64 bg-gray-50 min-h-screen transition-all duration-300">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.push(`/dashboard/${selectedRestaurant}/orders`)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
                <p className="text-gray-600 mt-1">View and manage order information</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={getStatusColor(order.status)}>
                  {order.status}
                </Badge>
                {order.status === 'ready' && (
                  <>
                    <Button
                      onClick={handleAnnounceOrder}
                      disabled={isAnnouncing}
                      className="bg-purple-500 hover:bg-purple-600 text-white"
                    >
                      <Volume2 className="h-4 w-4 mr-2" />
                      {isAnnouncing ? 'Announcing...' : 'Announce Ready'}
                    </Button>
                    <Button
                      onClick={() => handleUpdateStatus('completed')}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Served
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Customer Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{order.customer_name}</h3>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                      {order.customer_phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {order.customer_phone}
                        </div>
                      )}
                      {order.customer_email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {order.customer_email}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Order Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Order Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Order ID</p>
                      <p className="font-medium">{order.id.slice(0, 8)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date & Time</p>
                      <p className="font-medium">{formatDate(order.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="font-medium text-lg">{formatAmount(order.total_amount)}</p>
                    </div>
                  </div>
                  {order.notes && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Notes</p>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{order.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Order Items */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  {order.order_items && order.order_items.length > 0 ? (
                    <div className="space-y-3">
                      {order.order_items.map((item: OrderItem) => (
                        <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div>
                              <h4 className="font-semibold">{item.menu_item?.name}</h4>
                              {item.menu_item?.description && (
                                <p className="text-sm text-gray-600 mt-1">{item.menu_item?.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                            <div className="font-semibold">{formatAmount(item.unit_price)}</div>
                            <div className="text-sm text-gray-600">Subtotal: {formatAmount(item.subtotal)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No items in this order</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
