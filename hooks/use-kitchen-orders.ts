import useSWR from 'swr'
import type { Order } from '@/types/order'

export interface KitchenOrder extends Order {
  priority?: 'low' | 'normal' | 'high' | 'urgent' | 'vip'
  assigned_to?: string | null
  items: Array<{
    id: string
    name: string
    quantity: number
    price: number
    notes?: string
  }>
}

const fetcher = async (url: string) => {
  const token = localStorage.getItem('auth_token')
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || 'Failed to fetch kitchen orders')
  }
  return response.json()
}

export function useKitchenOrders(restaurantId?: string) {
  const { data, error, mutate } = useSWR<Order[]>(
    restaurantId ? `/api/orders?restaurantId=${restaurantId}&status=pending,confirmed,preparing` : null,
    fetcher,
    {
      refreshInterval: 5000,
      dedupingInterval: 2000,
    }
  )

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const token = localStorage.getItem('auth_token')
      console.log('[Kitchen Orders] Updating order status:', { orderId, status })
      
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('[Kitchen Orders] Update failed:', { 
          orderId, 
          status, 
          responseStatus: response.status,
          error: errorData 
        })
        throw new Error(errorData.error || `Failed to update order status (${response.status})`)
      }
      
      const updatedOrder = await response.json()
      console.log('[Kitchen Orders] Order updated successfully:', updatedOrder)
      
      mutate()
      return true
    } catch (error) {
      console.error('[Kitchen Orders] Error updating order status:', error)
      return false
    }
  }

  const kitchenOrders: KitchenOrder[] = (data || []).map(order => ({
    ...order,
    items: (order.order_items || []).map(item => ({
      id: item.id,
      name: `Item ${item.menu_item_id.substring(0, 4)}`, // This should be replaced with actual menu item name from API
      quantity: item.quantity,
      price: item.unit_price,
      notes: '', // Add from API if available
    })),
  }))

  return {
    orders: kitchenOrders,
    isLoading: !error && !data,
    error,
    refresh: mutate,
    updateOrderStatus,
  }
}
