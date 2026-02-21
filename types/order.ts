export interface Order {
  id: string
  restaurant_id: string
  customer_name: string
  customer_phone?: string
  customer_email?: string
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'
  total_amount: number
  order_type?: 'dine-in' | 'takeaway' | 'delivery' | 'catering'
  notes?: string
  created_at: string
  updated_at: string
  order_items?: Array<{
    id: string
    order_id: string
    menu_item_id: string
    quantity: number
    unit_price: number
    subtotal: number
  }>
}

export interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  notes?: string
}
