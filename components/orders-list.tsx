'use client'

import { useOrders } from '@/hooks/use-orders'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { useCurrency } from '@/hooks/use-currency'

interface OrdersListProps {
  restaurantId: string
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  ready: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
}

export function OrdersList({ restaurantId }: OrdersListProps) {
  const { orders, isLoading, error } = useOrders(restaurantId)
  const { formatAmount } = useCurrency({ restaurantId })

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading orders...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error loading orders: {error.message}</div>
  }

  // Ensure orders is an array
  const ordersArray = Array.isArray(orders) ? orders : []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Recent Orders</h3>
        <Link href={`/dashboard/${restaurantId}/orders/new`}>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </Link>
      </div>

      {ordersArray.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 px-4 py-8 text-center">
          <p className="text-sm text-gray-600">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ordersArray.map((order: any) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{order.customer_name}</h4>
                    <p className="text-sm text-gray-600 mt-0.5">Order #{order.id.slice(0, 8)}</p>
                  </div>
                  <Badge className={statusColors[order.status] || 'bg-gray-100 text-gray-800'}>
                    {order.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-gray-600">Phone</p>
                    <p className="font-medium text-gray-900">{order.customer_phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total</p>
                    <p className="font-medium text-gray-900">{formatAmount(order.total_amount)}</p>
                  </div>
                </div>

                {order.notes && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600">Notes</p>
                    <p className="text-sm text-gray-900">{order.notes}</p>
                  </div>
                )}

                <Link href={`/dashboard/${restaurantId}/orders/${order.id}`}>
                  <Button size="sm" variant="outline" className="w-full">
                    View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
