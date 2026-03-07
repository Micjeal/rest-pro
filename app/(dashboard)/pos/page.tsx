'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PaymentModal } from '@/components/pos/payment-modal'
import { Numpad } from '@/components/pos/numpad'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trash2, Plus, Minus, User, MapPin, Store, ChefHat, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import { SidebarNavigation } from '@/components/pos/sidebar-navigation'
import { useRestaurants } from '@/hooks/use-restaurants'
import { useMenus } from '@/hooks/use-menus'
import { useMenuItems } from '@/hooks/use-menu-items'
import { useCurrency } from '@/hooks/use-currency'
import { useCurrencyEvents } from '@/hooks/use-currency-context'
import { useCurrentUser } from '@/hooks/use-current-user'
import { EnhancedToggleGroup, EnhancedToggleGroupItem } from '@/components/ui/enhanced-toggle'

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  subtotal: number
  menuItemId?: string
}

interface Customer {
  name: string
  phone: string
  email?: string
}

interface Order {
  items: OrderItem[]
  customer: Customer
  tableNumber?: string
  subtotal: number
  taxAmount: number
  discountAmount: number
  total: number
  notes?: string
}

/**
 * POS Page
 * Route: /pos
 * Main point-of-sale interface for processing orders
 * Tablet-optimized with large touch targets
 */
export default function POSPage() {
  const [order, setOrder] = useState<Order>({
    items: [],
    customer: { name: '', phone: '' },
    subtotal: 0,
    taxAmount: 0,
    discountAmount: 0,
    total: 0,
  })

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [quantityInput, setQuantityInput] = useState('')
  const [showNumpad, setShowNumpad] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [discountPercent, setDiscountPercent] = useState(0)
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | undefined>(undefined)
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null)
  const [selectedTable, setSelectedTable] = useState<string>('10') // Default to table 10 as shown in image
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway' | 'delivery'>('dine-in')
  const [selectedCategory, setSelectedCategory] = useState<string>('desserts') // Default to desserts as shown in image
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile'>('cash')
  
  // Use real data from hooks
  const { restaurants, isLoading: restaurantsLoading, error: restaurantsError } = useRestaurants()
  const { menus, isLoading: menusLoading } = useMenus(selectedRestaurant)
  const { items, isLoading: itemsLoading } = useMenuItems(selectedMenu)
  const { formatAmount, getCurrencySymbol, loading: currencyLoading } = useCurrency({ restaurantId: selectedRestaurant })
  const { listenForCurrencyChanges } = useCurrencyEvents()
  const { user: currentUser, loading: userLoading } = useCurrentUser()
  
  const isLoading = restaurantsLoading || menusLoading || itemsLoading || currencyLoading

  // Set default restaurant when data loads
  useEffect(() => {
    if (restaurants.length > 0 && !selectedRestaurant) {
      setSelectedRestaurant(restaurants[0].id)
    }
  }, [restaurants, selectedRestaurant])
  
  // Set default menu when data loads
  useEffect(() => {
    if (menus.length > 0 && !selectedMenu) {
      setSelectedMenu(menus[0].id)
    }
  }, [menus, selectedMenu])
  
  // Listen for currency changes
  useEffect(() => {
    const cleanup = listenForCurrencyChanges((event) => {
      console.log('[POS] Currency changed:', event.detail)
      // Force re-render of components that use currency
      // The context will automatically update, so we just need to trigger a re-render
      setOrder(prev => ({ ...prev }))
    })
    
    return cleanup
  }, [listenForCurrencyChanges])
  
  // Tax rate (8% as shown in reference image)
  const TAX_RATE = 0.08 // 8%

  const addItemToOrder = (item: any) => {
    setSelectedItemId(item.id)
    setQuantityInput('')
    setShowNumpad(true)
    console.log('[POS] Selected item:', item.name)
  }

  const handleQuantityInput = (value: string) => {
    const newValue = quantityInput + value
    if (newValue.length <= 5) {
      setQuantityInput(newValue)
    }
  }

  const handleConfirmQuantity = () => {
    const quantity = parseInt(quantityInput) || 1
        const item = items.find((i: any) => i.id === selectedItemId)

        if (item) {
          const existingItem = order.items.find((i) => i.id === item.id)

          let newItems: OrderItem[]
          if (existingItem) {
            newItems = order.items.map((i) =>
              i.id === item.id
                ? {
                    ...i,
                    quantity: i.quantity + quantity,
                    subtotal: (i.quantity + quantity) * item.price,
                  }
                : i
            )
          } else {
            newItems = [
              ...order.items,
              {
                id: item.id,
                name: item.name,
                price: item.price,
                quantity,
                subtotal: quantity * item.price,
                menuItemId: item.id,
              },
            ]
          }

      updateOrder(newItems)
      setShowNumpad(false)
      setQuantityInput('')
      setSelectedItemId(null)
      toast.success(`Added ${quantity}x ${item.name}`)
      console.log('[POS] Added to order:', item.name, quantity)
    }
  }

  const updateOrder = (items: OrderItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
    const taxAmount = subtotal * TAX_RATE
    const total = subtotal + taxAmount

    setOrder({
      items,
      customer: order.customer,
      tableNumber: order.tableNumber,
      notes: order.notes,
      subtotal,
      taxAmount,
      discountAmount: 0, // No discount in reference design
      total,
    })
  }

  const removeItem = (itemId: string) => {
    const newItems = order.items.filter((i) => i.id !== itemId)
    updateOrder(newItems)
    console.log('[POS] Removed item:', itemId)
  }

  const updateItemQuantity = (itemId: string, change: number) => {
    const newItems = order.items
      .map((i) =>
        i.id === itemId
          ? {
              ...i,
              quantity: Math.max(1, i.quantity + change),
              subtotal: Math.max(1, i.quantity + change) * i.price,
            }
          : i
      )
      .filter((i) => i.quantity > 0)

    updateOrder(newItems)
  }

  const updateCustomer = (field: keyof Customer, value: string) => {
    setOrder(prev => ({
      ...prev,
      customer: {
        ...prev.customer,
        [field]: value
      }
    }))
  }

  const updateTable = (table: string) => {
    setOrder(prev => ({
      ...prev,
      tableNumber: table
    }))
  }

  const updateNotes = (notes: string) => {
    setOrder(prev => ({
      ...prev,
      notes
    }))
  }

  const handleCompletePayment = async (method: 'cash' | 'card' | 'mobile') => {
    try {
      // Validate required fields
      if (!order.customer.name || order.customer.name.trim() === '') {
        toast.error('Customer name is required')
        return
      }
      
      if (!order.customer.phone || order.customer.phone.trim() === '') {
        toast.error('Customer phone number is required')
        return
      }
      
      if (!currentUser) {
        toast.error('User not authenticated. Please log in again.')
        return
      }
      
      console.log('[POS] Processing payment:', { method, total: order.total, cashier: currentUser.name })

      // Step 1: Create order with basic fields
      const orderData = {
        restaurant_id: selectedRestaurant,
        customer_name: order.customer.name.trim(),
        customer_phone: order.customer.phone,
        customer_email: order.customer.email,
        total_amount: order.total,
        status: 'pending', // Start with pending status for kitchen workflow
        notes: order.notes,
        payment_method: paymentMethod,
        cashier_name: currentUser.name,
        staff_id: currentUser.id
      }

      console.log('[POS] Order data:', orderData)

      // Send order to API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(orderData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('[POS] Order creation failed:', errorData)
        throw new Error(`Failed to create order: ${errorData.error || 'Unknown error'}`)
      }

      const createdOrder = await response.json()
      console.log('[POS] Order created:', createdOrder)

      // Step 2: Add items to the order
      if (order.items.length > 0) {
        const itemPromises = order.items.map(item => {
          const itemData = {
            order_id: createdOrder.id,
            menu_item_id: item.menuItemId || item.id,
            quantity: item.quantity,
            unit_price: item.price,
            subtotal: item.price * item.quantity
          }

          return fetch('/api/order-items', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            },
            body: JSON.stringify(itemData)
          })
        })

        const itemResponses = await Promise.all(itemPromises)
        
        // Check if all items were added successfully
        const failedItems = itemResponses.filter(res => !res.ok)
        if (failedItems.length > 0) {
          console.error('[POS] Failed to add some items:', failedItems)
          // Don't throw error here, order was created successfully
        } else {
          console.log('[POS] All items added successfully')
        }
      }

      // Reset order
      setOrder({
        items: [],
        customer: { name: '', phone: '' },
        tableNumber: '',
        notes: '',
        subtotal: 0,
        taxAmount: 0,
        discountAmount: 0,
        total: 0,
      })
      setShowPayment(false)

      // Generate receipt (would navigate to receipt page)
      toast.success('Order completed! Receipt generated.')
    } catch (error) {
      console.error('[POS] Payment error:', error)
      toast.error('Payment failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Point of Sale</h1>
            <p className="text-green-100 mt-1">Process orders efficiently</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Order Type Selection */}
            <div className="kitchen-toggle-group-container">
              <div className="mb-2">
                <Label className="text-sm font-medium kitchen-text">Order Type</Label>
              </div>
              <EnhancedToggleGroup
                value={orderType}
                onValueChange={(value) => setOrderType(value as 'dine-in' | 'takeaway' | 'delivery')}
                className="w-full"
              >
                <EnhancedToggleGroupItem value="dine-in" icon={<Store className="h-4 w-4" />}>
                  Dine-In
                </EnhancedToggleGroupItem>
                <EnhancedToggleGroupItem value="takeaway">
                  Takeaway
                </EnhancedToggleGroupItem>
                <EnhancedToggleGroupItem value="delivery" icon={<MapPin className="h-4 w-4" />}>
                  Delivery
                </EnhancedToggleGroupItem>
              </EnhancedToggleGroup>
            </div>
            
            {/* Payment Method Selection */}
            <div className="kitchen-toggle-group-container">
              <div className="mb-2">
                <Label className="text-sm font-medium kitchen-text">Payment Method</Label>
              </div>
              <EnhancedToggleGroup
                value={paymentMethod}
                onValueChange={(value) => setPaymentMethod(value as 'cash' | 'card' | 'mobile')}
                className="w-full"
              >
                <EnhancedToggleGroupItem value="cash">
                  Cash
                </EnhancedToggleGroupItem>
                <EnhancedToggleGroupItem value="card">
                  Card
                </EnhancedToggleGroupItem>
                <EnhancedToggleGroupItem value="mobile">
                  Mobile
                </EnhancedToggleGroupItem>
              </EnhancedToggleGroup>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex gap-6 p-6">
        {/* Left Section - Order Entry */}
        <div className="flex-1 space-y-6">
          {/* Table Selection */}
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Store className="h-5 w-5 text-blue-600" />
                Select Table
              </CardTitle>
              <p className="text-sm text-gray-600">Choose the dining table</p>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-6 gap-3">
                {Array.from({ length: 12 }, (_, i) => {
                  const tableNumber = (i + 1).toString()
                  const isSelected = selectedTable === tableNumber
                  return (
                    <Button
                      key={tableNumber}
                      variant={isSelected ? 'default' : 'outline'}
                      className={`h-14 w-full font-semibold transition-all ${
                        isSelected
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md transform scale-105'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300'
                      }`}
                      onClick={() => {
                        setSelectedTable(tableNumber)
                        updateTable(tableNumber)
                      }}
                    >
                      {tableNumber}
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Menu Section */}
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-gray-200">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ChefHat className="h-5 w-5 text-orange-600" />
                Menu
              </CardTitle>
              <p className="text-sm text-gray-600">Select items to add to order</p>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              {/* Category Tabs */}
              <div className="flex gap-2 border-b border-gray-200 bg-gray-50 p-1 rounded-lg">
                <Button
                  variant={selectedCategory === 'appetizers' ? 'default' : 'ghost'}
                  className={`px-4 py-2 border-b-2 rounded-none transition-all ${
                    selectedCategory === 'appetizers'
                      ? 'border-orange-600 text-orange-600 bg-transparent font-semibold'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedCategory('appetizers')}
                >
                  Appetizers
                </Button>
                <Button
                  variant={selectedCategory === 'mains' ? 'default' : 'ghost'}
                  className={`px-4 py-2 border-b-2 rounded-none transition-all ${
                    selectedCategory === 'mains'
                      ? 'border-orange-600 text-orange-600 bg-transparent font-semibold'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedCategory('mains')}
                >
                  Mains
                </Button>
                <Button
                  variant={selectedCategory === 'desserts' ? 'default' : 'ghost'}
                  className={`px-4 py-2 border-b-2 rounded-none transition-all ${
                    selectedCategory === 'desserts'
                      ? 'border-orange-600 text-orange-600 bg-transparent font-semibold'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedCategory('desserts')}
                >
                  Desserts
                </Button>
                <Button
                  variant={selectedCategory === 'drinks' ? 'default' : 'ghost'}
                  className={`px-4 py-2 border-b-2 rounded-none transition-all ${
                    selectedCategory === 'drinks'
                      ? 'border-orange-600 text-orange-600 bg-transparent font-semibold'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedCategory('drinks')}
                >
                  Drinks
                </Button>
              </div>
              
              {/* Menu Items Grid */}
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-12">
                  <ChefHat className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No menu items available</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {items.map((item: any) => (
                    <Card key={item.id} className="border-gray-200 hover:shadow-lg transition-all hover:scale-105 cursor-pointer bg-white">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg">{item.name}</h3>
                            <p className="text-xl font-bold text-orange-600">{formatAmount(item.price)}</p>
                          </div>
                          <Button
                            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-md transition-all"
                            onClick={() => addItemToOrder(item)}
                            disabled={isLoading}
                          >
                            Add to Order
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Section - Current Order */}
        <div className="w-96">
          <Card className="bg-white border-gray-200 shadow-lg h-full">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white border-b border-gray-200">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Current Order
              </CardTitle>
              {selectedTable && (
                <p className="text-sm text-purple-100">Table {selectedTable}</p>
              )}
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Customer Information */}
              <div className="space-y-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <User className="h-4 w-4 text-purple-600" />
                  Customer Information
                </h3>
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="customer-name" className="text-sm font-medium text-gray-700">Name *</Label>
                    <Input
                      id="customer-name"
                      type="text"
                      value={order.customer.name}
                      onChange={(e) => updateCustomer('name', e.target.value)}
                      placeholder="Enter customer name"
                      className="w-full border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer-phone" className="text-sm font-medium text-gray-700">Phone Number *</Label>
                    <Input
                      id="customer-phone"
                      type="tel"
                      value={order.customer.phone}
                      onChange={(e) => updateCustomer('phone', e.target.value)}
                      placeholder="Enter phone number"
                      className="w-full border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer-email" className="text-sm font-medium text-gray-700">Email (Optional)</Label>
                    <Input
                      id="customer-email"
                      type="email"
                      value={order.customer.email || ''}
                      onChange={(e) => updateCustomer('email', e.target.value)}
                      placeholder="Enter email address"
                      className="w-full border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Order Notes */}
              <div className="space-y-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Label htmlFor="order-notes" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  Order Notes (Optional)
                </Label>
                <Input
                  id="order-notes"
                  type="text"
                  value={order.notes || ''}
                  onChange={(e) => updateNotes(e.target.value)}
                  placeholder="Add any special instructions..."
                  className="w-full border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Order Items */}

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {order.items.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No items added</p>
                  </div>
                ) : (
                  order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          {formatAmount(item.price)} each
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 border-gray-300"
                          onClick={() => updateItemQuantity(item.id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 border-gray-300"
                          onClick={() => updateItemQuantity(item.id, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Order Summary */}
              {order.items.length > 0 && (
                <>
                  <div className="border-t border-gray-200 pt-4 space-y-2 bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-900 font-medium">{formatAmount(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax (8%)</span>
                      <span className="text-gray-900 font-medium">{formatAmount(order.taxAmount)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-green-600 pt-2 border-t border-gray-300">
                      <span>Total</span>
                      <span>{formatAmount(order.total)}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-4">
                    <Button
                      variant="outline"
                      className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
                      onClick={() => {
                        // Create a printable receipt
                        const receiptContent = `
                          <html>
                            <head>
                              <title>Order Receipt</title>
                              <style>
                                body { font-family: Arial, sans-serif; margin: 20px; }
                                .header { text-align: center; margin-bottom: 20px; }
                                .items { margin: 20px 0; }
                                .item { display: flex; justify-content: space-between; margin: 5px 0; }
                                .total { border-top: 1px solid #000; padding-top: 10px; margin-top: 10px; }
                                .total-row { display: flex; justify-content: space-between; margin: 5px 0; }
                                .grand-total { font-weight: bold; font-size: 18px; }
                              </style>
                            </head>
                            <body>
                              <div class="header">
                                <h2>Restaurant POS</h2>
                                <p>Table ${selectedTable || 'N/A'}</p>
                                <p>${new Date().toLocaleString()}</p>
                              </div>
                              <div class="items">
                                ${order.items.map(item => `
                                  <div class="item">
                                    <span>${item.quantity}x ${item.name}</span>
                                    <span>${formatAmount(item.subtotal)}</span>
                                  </div>
                                `).join('')}
                              </div>
                              <div class="total">
                                <div class="total-row">
                                  <span>Subtotal:</span>
                                  <span>${formatAmount(order.subtotal)}</span>
                                </div>
                                <div class="total-row">
                                  <span>Tax (8%):</span>
                                  <span>${formatAmount(order.taxAmount)}</span>
                                </div>
                                <div class="total-row grand-total">
                                  <span>Total:</span>
                                  <span>${formatAmount(order.total)}</span>
                                </div>
                              </div>
                            </body>
                          </html>
                        `
                        
                        const printWindow = window.open('', '_blank')
                        if (printWindow) {
                          printWindow.document.write(receiptContent)
                          printWindow.document.close()
                          printWindow.print()
                        }
                      }}
                    >
                      Print Receipt
                    </Button>
                    <Button
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold shadow-lg transition-all"
                      onClick={() => setShowPayment(true)}
                    >
                      Complete Payment
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Numpad Modal */}
      {showNumpad && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="w-full max-w-sm bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-t-lg border-b border-slate-200/60 dark:border-slate-700/60">
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Enter Quantity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <Input
                type="text"
                value={quantityInput}
                readOnly
                className="text-center text-3xl font-bold h-16 bg-white/50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600"
                placeholder="0"
              />
              <Numpad
                onInput={handleQuantityInput}
                onClear={() => setQuantityInput('')}
                onDone={handleConfirmQuantity}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        amount={order.total}
        onConfirm={handleCompletePayment}
      />
    </div>
  )
}
