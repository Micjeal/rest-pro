import useSWR from 'swr'
import { useEffect, useMemo } from 'react'
import type { Order } from '@/types/order'

export interface KitchenOrder extends Order {
  priority?: 'low' | 'normal' | 'high' | 'urgent' | 'vip'
  assigned_to?: string | null
  order_type?: 'dine-in' | 'takeaway' | 'delivery' | 'catering'
  items: Array<{
    id: string
    name: string
    quantity: number
    price: number
    notes?: string
    description?: string
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
    restaurantId ? `/api/orders?restaurantId=${restaurantId}&status=pending,confirmed,preparing,ready` : null,
    fetcher,
    {
      refreshInterval: 5000,
      dedupingInterval: 2000,
    }
  )

  // Debug logging
  useEffect(() => {
    if (data) {
      console.log('[Kitchen Orders] Raw orders data:', data)
      console.log('[Kitchen Orders] Number of orders:', data.length)
    }
    if (error) {
      console.error('[Kitchen Orders] Error fetching orders:', error)
    }
  }, [data, error])

  // Transform the orders data
  const kitchenOrders: KitchenOrder[] = useMemo(() => {
    // If no real data, provide sample orders for testing
    if (!data || data.length === 0) {
      console.log('[Kitchen Orders] No real data, providing sample orders')
      return [
        {
          id: 'sample-order-1',
          restaurant_id: restaurantId || 'sample-restaurant-id',
          customer_name: 'John Doe',
          status: 'pending',
          total_amount: 25.99,
          created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
          updated_at: new Date().toISOString(),
          order_type: 'dine-in',
          items: [
            {
              id: 'item-1',
              name: 'Classic Burger',
              quantity: 2,
              price: 12.99,
              notes: 'No onions',
              description: 'Juicy beef patty with lettuce, tomato, and our special sauce'
            },
            {
              id: 'item-2', 
              name: 'French Fries',
              quantity: 1,
              price: 4.99,
              description: 'Crispy golden fries with sea salt'
            }
          ]
        },
        {
          id: 'sample-order-2',
          restaurant_id: restaurantId || 'sample-restaurant-id',
          customer_name: 'Jane Smith',
          status: 'preparing',
          total_amount: 18.50,
          created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(), // 25 minutes ago
          updated_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
          order_type: 'takeaway',
          items: [
            {
              id: 'item-3',
              name: 'Caesar Salad',
              quantity: 1,
              price: 14.99,
              notes: 'Extra croutons',
              description: 'Fresh romaine lettuce with parmesan cheese and caesar dressing'
            },
            {
              id: 'item-4',
              name: 'Iced Tea',
              quantity: 2,
              price: 3.50,
              description: 'Fresh brewed iced tea with lemon'
            }
          ]
        },
        {
          id: 'sample-order-3',
          restaurant_id: restaurantId || 'sample-restaurant-id',
          customer_name: 'Bob Johnson',
          status: 'ready',
          total_amount: 32.75,
          created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
          updated_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
          order_type: 'delivery',
          items: [
            {
              id: 'item-5',
              name: 'Grilled Chicken Sandwich',
              quantity: 1,
              price: 16.99,
              description: 'Grilled chicken breast with avocado and bacon'
            },
            {
              id: 'item-6',
              name: 'Onion Rings',
              quantity: 1,
              price: 5.99,
              description: 'Beer battered onion rings with dipping sauce'
            },
            {
              id: 'item-7',
              name: 'Chocolate Shake',
              quantity: 1,
              price: 9.77,
              description: 'Thick and creamy chocolate milkshake'
            }
          ]
        }
      ]
    }

    return (data || []).map(order => ({
      ...order,
      items: (order.order_items || []).map(item =>({
        id: item.id,
        name: (item as any).menu_items?.name || `Item ${(item as any).menu_item_id?.substring(0, 4) || 'Unknown'}`,
        quantity: item.quantity,
        price: item.unit_price,
        notes: (item as any).notes || '',
        description: (item as any).menu_items?.description || '',
      })),
    }))
  }, [data, restaurantId])

  // Debug the transformed orders
  useEffect(() => {
    console.log('[Kitchen Orders] Transformed orders:', kitchenOrders)
    console.log('[Kitchen Orders] Orders with items:', kitchenOrders.filter(o => o.items.length > 0).length)
  }, [kitchenOrders])

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

  return {
    orders: kitchenOrders,
    isLoading: !error && !data,
    error,
    refresh: mutate,
    updateOrderStatus,
  }
}
