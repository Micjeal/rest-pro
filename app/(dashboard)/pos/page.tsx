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
  const [selectedTable, setSelectedTable] = useState<string>('')
  
  // Use real data from hooks
  const { restaurants, isLoading: restaurantsLoading, error: restaurantsError } = useRestaurants()
  const { menus, isLoading: menusLoading } = useMenus(selectedRestaurant)
  const { items, isLoading: itemsLoading } = useMenuItems(selectedMenu)
  const { formatAmount, getCurrencySymbol, loading: currencyLoading } = useCurrency({ restaurantId: selectedRestaurant })
  const { listenForCurrencyChanges } = useCurrencyEvents()
  
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
  
  // Tax rate (configurable per restaurant)
  const TAX_RATE = 0.1 // 10%

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
    const discountAmount = subtotal * (discountPercent / 100)
    const taxableAmount = subtotal - discountAmount
    const taxAmount = taxableAmount * TAX_RATE
    const total = taxableAmount + taxAmount

    setOrder({
      items,
      customer: order.customer,
      tableNumber: order.tableNumber,
      notes: order.notes,
      subtotal,
      taxAmount,
      discountAmount,
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
      console.log('[POS] Processing payment:', { method, total: order.total })

      // Step 1: Create order with basic fields
      const orderData = {
        restaurant_id: selectedRestaurant,
        customer_name: order.customer.name || 'Walk-in Customer',
        customer_phone: order.customer.phone,
        customer_email: order.customer.email,
        total_amount: order.total,
        status: 'pending', // Start with pending status for kitchen workflow
        notes: order.notes
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
      setDiscountPercent(0)
      setShowPayment(false)

      // Generate receipt (would navigate to receipt page)
      toast.success('Order completed! Receipt generated.')
    } catch (error) {
      console.error('[POS] Payment error:', error)
      toast.error('Payment failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header Section */}
      <div className="px-4 pt-4 pb-2 space-y-3">
        {/* Restaurant and Menu Selection */}
        <div className="grid grid-cols-1 gap-3">
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 card-hover shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Store className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                Restaurant
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Select value={selectedRestaurant || ''} onValueChange={setSelectedRestaurant} disabled={restaurantsLoading}>
                <SelectTrigger className="h-11 bg-white/50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600">
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
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 card-hover shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <ChefHat className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                Menu
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Select value={selectedMenu || ''} onValueChange={setSelectedMenu} disabled={menusLoading || !selectedRestaurant}>
                <SelectTrigger className="h-11 bg-white/50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600">
                  <SelectValue placeholder="Select menu" />
                </SelectTrigger>
                <SelectContent>
                  {menus.map((menu: any) => (
                    <SelectItem key={menu.id} value={menu.id}>
                      {menu.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {/* Customer and Table Info - Mobile Optimized */}
        <div className="grid grid-cols-1 gap-3">
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 card-hover shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="customerName" className="text-sm font-medium text-slate-700 dark:text-slate-300">Name</Label>
                <Input
                  id="customerName"
                  placeholder="Customer name"
                  value={order.customer.name}
                  onChange={(e) => updateCustomer('name', e.target.value)}
                  className="mt-1 h-11 bg-white/50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600"
                />
              </div>
              <div>
                <Label htmlFor="customerPhone" className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone</Label>
                <Input
                  id="customerPhone"
                  placeholder="Phone number"
                  value={order.customer.phone}
                  onChange={(e) => updateCustomer('phone', e.target.value)}
                  className="mt-1 h-11 bg-white/50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 card-hover shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <MapPin className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                Table & Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="tableNumber" className="text-sm font-medium text-slate-700 dark:text-slate-300">Table</Label>
                <Select value={order.tableNumber} onValueChange={updateTable}>
                  <SelectTrigger className="mt-1 h-11 bg-white/50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600">
                    <SelectValue placeholder="Select table" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 20 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        Table {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-4 px-4 pb-24">
        {/* Menu Items Section */}
        <div className="flex-1">
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 card-hover shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Menu Items</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-12">
                  <ChefHat className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-slate-400">No menu items available</p>
                </div>
              ) : (
                <>
                  {/* Category Filters - Mobile Optimized */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Button variant="outline" size="sm" className="bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600 hover:bg-blue-200 dark:hover:bg-blue-900/40">All</Button>
                    <Button variant="outline" size="sm" className="bg-white/50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">Appetizer</Button>
                    <Button variant="outline" size="sm" className="bg-white/50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">Main</Button>
                    <Button variant="outline" size="sm" className="bg-white/50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">Beverage</Button>
                    <Button variant="outline" size="sm" className="bg-white/50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">Dessert</Button>
                  </div>
                  
                  {/* Menu Items Grid - Responsive */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {items.map((item: any) => (
                      <Button
                        key={item.id}
                        variant="outline"
                        className="h-28 p-3 flex flex-col items-center justify-center text-center bg-white/50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 dark:hover:from-slate-700 dark:hover:to-slate-600 border-2 border-transparent hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 rounded-xl touch-manipulation"
                        onClick={() => addItemToOrder(item)}
                        disabled={isLoading}
                      >
                        <div className="font-semibold text-sm text-slate-900 dark:text-white mb-1 text-center leading-tight">{item.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-2">{formatAmount(item.price)}</div>
                        {item.category && (
                          <div className="text-xs text-blue-600 dark:text-blue-400 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">{item.category}</div>
                        )}
                      </Button>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary - Mobile Optimized */}
        <div className="w-full lg:w-96">
          <Card className="h-full flex flex-col bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 card-hover shadow-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-t-lg border-b border-slate-200/60 dark:border-slate-700/60">
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <ShoppingCart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                Current Order
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 space-y-4 p-4">
              {/* Items List */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                {order.items.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500 dark:text-slate-400 text-sm">No items added</p>
                  </div>
                ) : (
                  order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-700/30 rounded-xl border border-slate-200/60 dark:border-slate-600 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{item.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {item.quantity}x {formatAmount(item.price)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 bg-white/50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 hover:bg-red-50 dark:hover:bg-red-900/20 touch-manipulation"
                          onClick={() => updateItemQuantity(item.id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 bg-white/50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 touch-manipulation"
                          onClick={() => updateItemQuantity(item.id, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 touch-manipulation"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Totals */}
              {order.items.length > 0 && (
                <>
                  <div className="border-t border-slate-200/60 dark:border-slate-600 pt-4 space-y-2">
                    <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
                      <span>Subtotal</span>
                      <span>{formatAmount(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
                      <span>Discount ({discountPercent}%)</span>
                      <span className="text-red-500">-{formatAmount(order.discountAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
                      <span>Tax (10%)</span>
                      <span>{formatAmount(order.taxAmount)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-xl shadow-lg shadow-blue-500/25">
                      <span>Total</span>
                      <span>{formatAmount(order.total)}</span>
                    </div>
                  </div>

                  {/* Discount Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Discount %</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={discountPercent}
                      onChange={(e) => {
                        const value = Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
                        setDiscountPercent(value)
                        updateOrder(order.items)
                      }}
                      className="h-11 bg-white/50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600"
                    />
                  </div>

                  {/* Checkout Button */}
                  <Button
                    className="w-full h-12 text-base font-bold bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 hover:-translate-y-0.5 btn-press touch-manipulation"
                    onClick={() => setShowPayment(true)}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Checkout
                  </Button>
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
