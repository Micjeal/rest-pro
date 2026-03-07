'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PaymentModal } from '@/components/pos/payment-modal'
import { Numpad } from '@/components/pos/numpad'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trash2, Plus, Minus, User, MapPin, Store, ChefHat, ShoppingCart, Search } from 'lucide-react'
import { toast } from 'sonner'
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
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | undefined>(undefined)
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null)
  const [selectedTable, setSelectedTable] = useState<string>('10') // Default to table 10 as shown in image
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway' | 'delivery'>('dine-in')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [menuSearch, setMenuSearch] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile'>('cash')
  
  // Use real data from hooks
  const { restaurants, isLoading: restaurantsLoading } = useRestaurants()
  const { menus, isLoading: menusLoading } = useMenus(selectedRestaurant)
  const { items, isLoading: itemsLoading } = useMenuItems(selectedMenu)
  const { formatAmount, loading: currencyLoading } = useCurrency({ restaurantId: selectedRestaurant })
  const { listenForCurrencyChanges } = useCurrencyEvents()
  const { user: currentUser } = useCurrentUser()
  
  const isLoading = restaurantsLoading || menusLoading || itemsLoading || currencyLoading
  const filteredMenuItems = useMemo(() => {
    const normalizedSearch = menuSearch.trim().toLowerCase()

    return items.filter((item: any) => {
      const rawCategory = String(item.category || item.type || '').toLowerCase()
      const name = String(item.name || '').toLowerCase()
      const description = String(item.description || '').toLowerCase()

      const searchMatch =
        normalizedSearch.length === 0 ||
        name.includes(normalizedSearch) ||
        description.includes(normalizedSearch) ||
        rawCategory.includes(normalizedSearch)

      if (selectedCategory === 'all') {
        return searchMatch
      }

      if (!rawCategory) {
        return searchMatch
      }

      const normalized = selectedCategory.endsWith('s')
        ? selectedCategory.slice(0, -1)
        : selectedCategory

      const categoryMatch =
        rawCategory.includes(selectedCategory) ||
        rawCategory.includes(normalized)

      return categoryMatch && searchMatch
    })
  }, [items, selectedCategory, menuSearch])

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
    <div className="min-h-screen bg-slate-50">
      {/* Header Section */}
      <div className="border-b border-slate-200 bg-white px-4 py-4 lg:px-6">
        <div className="mx-auto max-w-[1600px]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 lg:text-3xl">Point of Sale</h1>
              <p className="mt-1 text-sm text-slate-600">Create and complete orders with a clean workflow</p>
            </div>
            
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium uppercase tracking-wide text-slate-500">Restaurant</Label>
                <Select value={selectedRestaurant || ''} onValueChange={setSelectedRestaurant} disabled={restaurantsLoading}>
                  <SelectTrigger className="h-10 w-full min-w-[180px]">
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
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium uppercase tracking-wide text-slate-500">Menu</Label>
                <Select value={selectedMenu || ''} onValueChange={setSelectedMenu} disabled={menusLoading}>
                  <SelectTrigger className="h-10 w-full min-w-[180px]">
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
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                <div className="mb-2">
                  <Label className="text-xs font-medium uppercase tracking-wide text-slate-500">Order Type</Label>
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
              
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                <div className="mb-2">
                  <Label className="text-xs font-medium uppercase tracking-wide text-slate-500">Payment</Label>
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
      </div>

      {/* Main Content Area */}
      <div className="mx-auto grid max-w-[1600px] gap-6 p-4 lg:p-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* Left Section - Order Entry */}
        <div className="space-y-6">
          {/* Table Selection */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-200 bg-slate-50/70">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <Store className="h-5 w-5 text-slate-600" />
                Select Table
              </CardTitle>
              <p className="text-sm text-slate-600">Choose the active table for this order</p>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                {Array.from({ length: 12 }, (_, i) => {
                  const tableNumber = (i + 1).toString()
                  const isSelected = selectedTable === tableNumber
                  return (
                    <Button
                      key={tableNumber}
                      variant={isSelected ? 'default' : 'outline'}
                      className={`h-12 w-full font-semibold transition-colors ${
                        isSelected
                          ? 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900'
                          : 'border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
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
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-200 bg-slate-50/70">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <ChefHat className="h-5 w-5 text-slate-600" />
                Menu
              </CardTitle>
              <p className="text-sm text-slate-600">Select items to add to order</p>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  placeholder="Search menu items..."
                  className="h-10 pl-9"
                />
              </div>

              {/* Category Tabs */}
              <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
                <Button
                  size="sm"
                  variant={selectedCategory === 'all' ? 'default' : 'ghost'}
                  className={`capitalize transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900'
                      : 'border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
                  }`}
                  onClick={() => setSelectedCategory('all')}
                >
                  All
                </Button>
                <Button
                  size="sm"
                  variant={selectedCategory === 'appetizers' ? 'default' : 'ghost'}
                  className={`capitalize transition-colors ${
                    selectedCategory === 'appetizers'
                      ? 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900'
                      : 'border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
                  }`}
                  onClick={() => setSelectedCategory('appetizers')}
                >
                  Appetizers
                </Button>
                <Button
                  size="sm"
                  variant={selectedCategory === 'mains' ? 'default' : 'ghost'}
                  className={`capitalize transition-colors ${
                    selectedCategory === 'mains'
                      ? 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900'
                      : 'border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
                  }`}
                  onClick={() => setSelectedCategory('mains')}
                >
                  Mains
                </Button>
                <Button
                  size="sm"
                  variant={selectedCategory === 'desserts' ? 'default' : 'ghost'}
                  className={`capitalize transition-colors ${
                    selectedCategory === 'desserts'
                      ? 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900'
                      : 'border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
                  }`}
                  onClick={() => setSelectedCategory('desserts')}
                >
                  Desserts
                </Button>
                <Button
                  size="sm"
                  variant={selectedCategory === 'drinks' ? 'default' : 'ghost'}
                  className={`capitalize transition-colors ${
                    selectedCategory === 'drinks'
                      ? 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900'
                      : 'border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
                  }`}
                  onClick={() => setSelectedCategory('drinks')}
                >
                  Drinks
                </Button>
              </div>
              
              {/* Menu Items Grid */}
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700 dark:border-slate-700 dark:border-t-slate-200"></div>
                </div>
              ) : filteredMenuItems.length === 0 ? (
                <div className="text-center py-12">
                  <ChefHat className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No menu items for this category</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredMenuItems.map((item: any) => (
                    <Card key={item.id} className="cursor-pointer border-slate-200 bg-white shadow-sm transition-all hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{item.name}</h3>
                            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{formatAmount(item.price)}</p>
                          </div>
                          <Button
                            className="w-full bg-slate-900 font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
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
        <div className="xl:sticky xl:top-6">
          <Card className="h-full border-slate-200 shadow-sm dark:border-slate-800">
            <CardHeader className="border-b border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/50">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                <ShoppingCart className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                Current Order
              </CardTitle>
              {selectedTable && (
                <p className="text-sm text-slate-600 dark:text-slate-400">Table {selectedTable}</p>
              )}
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Customer Information */}
              <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/50">
                <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                  <User className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                  Customer Information
                </h3>
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="customer-name" className="text-xs font-medium uppercase tracking-wide text-slate-500">Name *</Label>
                    <Input
                      id="customer-name"
                      type="text"
                      value={order.customer.name}
                      onChange={(e) => updateCustomer('name', e.target.value)}
                      placeholder="Enter customer name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer-phone" className="text-xs font-medium uppercase tracking-wide text-slate-500">Phone Number *</Label>
                    <Input
                      id="customer-phone"
                      type="tel"
                      value={order.customer.phone}
                      onChange={(e) => updateCustomer('phone', e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer-email" className="text-xs font-medium uppercase tracking-wide text-slate-500">Email (Optional)</Label>
                    <Input
                      id="customer-email"
                      type="email"
                      value={order.customer.email || ''}
                      onChange={(e) => updateCustomer('email', e.target.value)}
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
              </div>

              {/* Order Notes */}
              <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/50">
                <Label htmlFor="order-notes" className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Order Notes (Optional)
                </Label>
                <Input
                  id="order-notes"
                  type="text"
                  value={order.notes || ''}
                  onChange={(e) => updateNotes(e.target.value)}
                  placeholder="Add any special instructions..."
                />
              </div>

              {/* Order Items */}

              <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {order.items.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center dark:border-slate-700">
                    <ShoppingCart className="mx-auto mb-2 h-8 w-8 text-slate-400 dark:text-slate-500" />
                    <p className="text-sm text-slate-600 dark:text-slate-400">No items added</p>
                  </div>
                ) : (
                  order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {formatAmount(item.price)} each
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => updateItemQuantity(item.id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-7 text-center text-sm font-medium text-slate-900 dark:text-slate-100">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => updateItemQuantity(item.id, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40"
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
                  <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/50">
                    <div className="flex justify-between text-sm text-slate-700 dark:text-slate-300">
                      <span>Subtotal</span>
                      <span className="font-medium">{formatAmount(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-700 dark:text-slate-300">
                      <span>Tax (8%)</span>
                      <span className="font-medium">{formatAmount(order.taxAmount)}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-300 pt-2 text-base font-semibold text-slate-900 dark:border-slate-700 dark:text-slate-100">
                      <span>Total</span>
                      <span>{formatAmount(order.total)}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full"
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
                      className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-sm border-slate-200 shadow-xl dark:border-slate-800">
            <CardHeader className="border-b border-slate-200 dark:border-slate-800">
              <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">Enter Quantity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <Input
                type="text"
                value={quantityInput}
                readOnly
                className="h-16 text-center text-3xl font-bold"
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
