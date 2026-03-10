'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Trash2, 
  Calendar, 
  DollarSign, 
  Users, 
  Filter, 
  Download,
  Archive,
  Search,
  ChevronDown,
  ChevronUp,
  Eye
} from 'lucide-react'
import { useCurrency } from '@/hooks/use-currency'

interface Order {
  id: string
  customer_name: string
  customer_phone?: string
  customer_email?: string
  total_amount: number
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
  order_items?: Array<{
    menu_items?: {
      name: string
    }
  }>
}

interface OrderManagementPanelProps {
  isOpen: boolean
  onClose: () => void
  currentUser: {
    id: string
    role: string
  }
  orders?: Order[] // Optional orders prop for existing data
  restaurantId?: string // Optional restaurant ID for context
  onRefresh?: () => void // Callback to refresh parent data
}

export function OrderManagementPanel({ isOpen, onClose, currentUser, orders: initialOrders = [], restaurantId, onRefresh }: OrderManagementPanelProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('recent')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [ageFilter, setAgeFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [sortField, setSortField] = useState<'created_at' | 'total_amount' | 'customer_name'>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Use currency context for proper formatting
  const { formatAmount } = useCurrency({ restaurantId })

  // Create stable references for dependencies
  const ordersIds = useMemo(() => initialOrders.map(o => o.id).join(','), [initialOrders])
  const ordersLength = initialOrders.length

  // Update internal orders when initialOrders change (with stable reference check)
  useEffect(() => {
    console.log('[OrderManagementPanel] Initial orders updated:', initialOrders.length, initialOrders)
    setOrders(initialOrders)
  }, [ordersLength, ordersIds]) // More stable dependencies

  // Fetch orders when panel opens and no initial orders provided
  useEffect(() => {
    console.log('[OrderManagementPanel] Panel opened, initialOrders.length:', initialOrders.length)
    if (isOpen && !ordersLength) {
      fetchOrders()
    }
  }, [isOpen, ordersLength])

  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('auth_token')
      const params = new URLSearchParams({
        limit: '100',
        sortBy: sortField,
        sortDirection: sortDirection
      })

      // Add restaurantId filter if provided
      if (restaurantId) {
        params.append('restaurantId', restaurantId)
      }

      // Add filters to params
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      if (searchTerm) {
        params.append('search', searchTerm)
      }
      if (dateRange.start) {
        params.append('dateFrom', dateRange.start)
      }
      if (dateRange.end) {
        params.append('dateTo', dateRange.end)
      }
      if (ageFilter !== 'all') {
        switch (ageFilter) {
          case '7+':
            params.append('minAge', '7')
            break
          case '14+':
            params.append('minAge', '14')
            break
          case '30+':
            params.append('minAge', '30')
            break
        }
      }

      const response = await fetch(`/api/orders/management?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders)
        console.log('[OrderManagement] Loaded orders:', data.orders.length, 'Total:', data.totalCount)
      }
    } catch (error) {
      console.error('[OrderManagement] Error fetching orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Helper functions - defined before use to prevent hoisting issues
  const getOrderAge = (createdAt: string) => {
    const created = new Date(createdAt)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - created.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-amber-100 text-amber-800'
      case 'processing':
      case 'preparing':
        return 'bg-blue-100 text-blue-800'
      case 'ready':
        return 'bg-purple-100 text-purple-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getAgeColor = (age: number) => {
    if (age >= 30) return 'bg-red-100 text-red-800'
    if (age >= 14) return 'bg-orange-100 text-orange-800'
    if (age >= 7) return 'bg-yellow-100 text-yellow-800'
    return 'bg-gray-100 text-gray-800'
  }

  // Filter and sort orders
  const filteredOrders = orders
    .filter(order => {
      // Search filter
      if (searchTerm && !order.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      
      // Status filter
      if (statusFilter !== 'all' && order.status !== statusFilter) {
        return false
      }
      
      // Age filter
      if (ageFilter !== 'all') {
        const orderAge = getOrderAge(order.created_at)
        switch (ageFilter) {
          case '7+':
            if (orderAge < 7) return false
            break
          case '14+':
            if (orderAge < 14) return false
            break
          case '30+':
            if (orderAge < 30) return false
            break
        }
      }
      
      // Date range filter
      if (dateRange.start && new Date(order.created_at) < new Date(dateRange.start)) {
        return false
      }
      if (dateRange.end && new Date(order.created_at) > new Date(dateRange.end)) {
        return false
      }
      
      return true
    })
    .sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
        case 'total_amount':
          comparison = a.total_amount - b.total_amount
          break
        case 'customer_name':
          comparison = a.customer_name.localeCompare(b.customer_name)
          break
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

  // Debug logging
  console.log('[OrderManagementPanel] Orders state:', {
    initialOrders: initialOrders.length,
    internalOrders: orders.length,
    filteredOrders: filteredOrders.length,
    isLoading,
    restaurantId,
    searchTerm,
    statusFilter
  })

  const toggleOrderSelection = (orderId: string) => {
    const newSelected = new Set(selectedOrders)
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId)
    } else {
      newSelected.add(orderId)
    }
    setSelectedOrders(newSelected)
  }

  const toggleAllOrders = () => {
    if (selectedOrders.size === filteredOrders.length) {
      setSelectedOrders(new Set())
    } else {
      setSelectedOrders(new Set(filteredOrders.map(order => order.id)))
    }
  }

  const getSelectionSummary = () => {
    const selectedOrdersList = filteredOrders.filter(order => selectedOrders.has(order.id))
    const totalAmount = selectedOrdersList.reduce((sum, order) => sum + order.total_amount, 0)
    const ages = selectedOrdersList.map(order => getOrderAge(order.created_at))
    const minAge = ages.length > 0 ? Math.min(...ages) : 0
    const maxAge = ages.length > 0 ? Math.max(...ages) : 0
    
    return {
      count: selectedOrdersList.length,
      totalAmount,
      ageRange: ages.length > 0 ? `${minAge}-${maxAge} days` : 'N/A'
    }
  }

  const handleBulkSelect = (criteria: string) => {
    const newSelected = new Set<string>()
    
    switch (criteria) {
      case 'completed':
        filteredOrders
          .filter(order => order.status === 'completed')
          .forEach(order => newSelected.add(order.id))
        break
      case '7days':
        filteredOrders
          .filter(order => getOrderAge(order.created_at) >= 7)
          .forEach(order => newSelected.add(order.id))
        break
      case '14days':
        filteredOrders
          .filter(order => getOrderAge(order.created_at) >= 14)
          .forEach(order => newSelected.add(order.id))
        break
      case '30days':
        filteredOrders
          .filter(order => getOrderAge(order.created_at) >= 30)
          .forEach(order => newSelected.add(order.id))
        break
    }
    
    setSelectedOrders(newSelected)
  }

  const handleDeleteSelected = async () => {
    if (selectedOrders.size === 0) return
    
    setIsDeleting(true)
    try {
      const token = localStorage.getItem('auth_token')
      const selectedOrderIds = Array.from(selectedOrders)
      
      const response = await fetch('/api/orders/selected', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderIds: selectedOrderIds,
          confirmation: 'DELETE'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete orders')
      }

      const result = await response.json()
      console.log('[OrderManagement] Orders deleted successfully:', result)
      
      // Refresh orders and clear selection
      await fetchOrders()
      setSelectedOrders(new Set())
      setShowDeleteConfirm(false)
      
      // Call parent refresh callback
      if (onRefresh) {
        onRefresh()
      }
      
    } catch (error) {
      console.error('[OrderManagement] Error deleting orders:', error)
      throw error
    } finally {
      setIsDeleting(false)
    }
  }

  const handleArchiveSelected = async () => {
    if (selectedOrders.size === 0) return
    
    try {
      const token = localStorage.getItem('auth_token')
      const selectedOrderIds = Array.from(selectedOrders)
      
      const response = await fetch('/api/orders/archive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderIds: selectedOrderIds,
          confirmation: 'ARCHIVE'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to archive orders')
      }

      const result = await response.json()
      console.log('[OrderManagement] Orders archived successfully:', result)
      
      // Create CSV content for archived orders
      const headers = ['Order ID', 'Customer Name', 'Customer Phone', 'Customer Email', 'Amount', 'Status', 'Created At', 'Updated At', 'Archived At']
      const archivedAt = new Date().toISOString()
      
      const csvContent = [
        headers.join(','),
        ...result.archivedOrders.map((order: any) => [
          `#${order.id.slice(-8)}`,
          `"${order.customer}"`,
          `"${order.customer_phone || ''}"`,
          `"${order.customer_email || ''}"`,
          formatAmount(order.total_amount).replace(/[^0-9.-]/g, ''), // Remove currency symbol for CSV
          order.status,
          order.created_at,
          order.updated_at || '',
          archivedAt
        ].join(','))
      ].join('\n')
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `archived_orders_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Refresh orders and clear selection
      await fetchOrders()
      setSelectedOrders(new Set())
      
      // Call parent refresh callback
      if (onRefresh) {
        onRefresh()
      }
      
      alert(`Successfully archived and downloaded ${result.archivedCount} orders`)
      
    } catch (error) {
      console.error('[OrderManagement] Error archiving orders:', error)
      alert(error instanceof Error ? error.message : 'Failed to archive orders')
    }
  }

  const handleExportSelected = () => {
    if (selectedOrders.size === 0) return
    
    const selectedOrdersList = filteredOrders.filter(order => selectedOrders.has(order.id))
    
    // Create CSV content
    const headers = ['Order ID', 'Customer Name', 'Customer Phone', 'Customer Email', 'Amount', 'Status', 'Created At', 'Updated At']
    const csvContent = [
      headers.join(','),
      ...selectedOrdersList.map(order => [
        `#${order.id.slice(-8)}`,
        `"${order.customer_name}"`,
        `"${order.customer_phone || ''}"`,
        `"${order.customer_email || ''}"`,
        formatAmount(order.total_amount).replace(/[^0-9.-]/g, ''), // Remove currency symbol for CSV
        order.status,
        order.created_at,
        order.updated_at
      ].join(','))
    ].join('\n')
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    console.log('[OrderManagement] Exported', selectedOrdersList.length, 'orders')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
        <CardHeader className="border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Order Management</CardTitle>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 overflow-auto flex-1">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="recent">Recent Orders</TabsTrigger>
              <TabsTrigger value="clear">Clear Old Orders</TabsTrigger>
            </TabsList>
            
            <TabsContent value="recent" className="space-y-4 max-h-[calc(90vh-200px)] overflow-y-auto">
              {/* Search and Filters */}
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by customer name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="preparing">Preparing</SelectItem>
                      <SelectItem value="ready">Ready</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={ageFilter} onValueChange={setAgeFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Age" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ages</SelectItem>
                      <SelectItem value="7+">7+ days</SelectItem>
                      <SelectItem value="14+">14+ days</SelectItem>
                      <SelectItem value="30+">30+ days</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="outline"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </div>
              </div>
              
              {/* Advanced Filters */}
              {showAdvancedFilters && (
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>From Date</Label>
                      <Input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>To Date</Label>
                      <Input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Sort By</Label>
                      <Select value={sortField} onValueChange={(value: any) => setSortField(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="created_at">Date</SelectItem>
                          <SelectItem value="total_amount">Amount</SelectItem>
                          <SelectItem value="customer_name">Customer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                    >
                      {sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Orders Table */}
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                      <tr>
                        <th className="p-3 text-left">
                          <Checkbox
                            checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
                            onCheckedChange={toggleAllOrders}
                          />
                        </th>
                        <th className="p-3 text-left">Order ID</th>
                        <th className="p-3 text-left">Customer</th>
                        <th className="p-3 text-left">Amount</th>
                        <th className="p-3 text-left">Status</th>
                        <th className="p-3 text-left">Age</th>
                        <th className="p-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="border-t hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="p-3">
                            <Checkbox
                              checked={selectedOrders.has(order.id)}
                              onCheckedChange={() => toggleOrderSelection(order.id)}
                            />
                          </td>
                          <td className="p-3 font-mono text-sm">#{order.id.slice(-8)}</td>
                          <td className="p-3">{order.customer_name}</td>
                          <td className="p-3">{formatAmount(order.total_amount)}</td>
                          <td className="p-3">
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge className={getAgeColor(getOrderAge(order.created_at))}>
                              {getOrderAge(order.created_at)} days
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="clear" className="space-y-4 max-h-[calc(90vh-200px)] overflow-y-auto">
              {/* Selection Summary */}
              {selectedOrders.size > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Selection Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{getSelectionSummary().count}</div>
                        <div className="text-sm text-gray-600">Orders Selected</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{formatAmount(getSelectionSummary().totalAmount)}</div>
                        <div className="text-sm text-gray-600">Total Amount</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{getSelectionSummary().ageRange}</div>
                        <div className="text-sm text-gray-600">Age Range</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Bulk Selection Tools */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Selection</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleBulkSelect('completed')}
                      className="flex items-center gap-2"
                    >
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      Completed Orders
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleBulkSelect('7days')}
                      className="flex items-center gap-2"
                    >
                      <Calendar className="h-4 w-4" />
                      7+ Days Old
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleBulkSelect('14days')}
                      className="flex items-center gap-2"
                    >
                      <Calendar className="h-4 w-4" />
                      14+ Days Old
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleBulkSelect('30days')}
                      className="flex items-center gap-2"
                    >
                      <Calendar className="h-4 w-4" />
                      30+ Days Old
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Selected Orders List */}
              {selectedOrders.size > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Selected Orders ({selectedOrders.size})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg overflow-hidden">
                      <div className="overflow-x-auto max-h-64 overflow-y-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                            <tr>
                              <th className="p-3 text-left">Order ID</th>
                              <th className="p-3 text-left">Customer</th>
                              <th className="p-3 text-left">Amount</th>
                              <th className="p-3 text-left">Status</th>
                              <th className="p-3 text-left">Age</th>
                              <th className="p-3 text-left">Remove</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredOrders
                              .filter(order => selectedOrders.has(order.id))
                              .map((order) => (
                                <tr key={order.id} className="border-t hover:bg-gray-50 dark:hover:bg-gray-700">
                                  <td className="p-3 font-mono text-sm">#{order.id.slice(-8)}</td>
                                  <td className="p-3">{order.customer_name}</td>
                                  <td className="p-3">{formatAmount(order.total_amount)}</td>
                                  <td className="p-3">
                                    <Badge className={getStatusColor(order.status)}>
                                      {order.status}
                                    </Badge>
                                  </td>
                                  <td className="p-3">
                                    <Badge className={getAgeColor(getOrderAge(order.created_at))}>
                                      {getOrderAge(order.created_at)} days
                                    </Badge>
                                  </td>
                                  <td className="p-3">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleOrderSelection(order.id)}
                                      className="text-red-600 hover:text-red-800"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      variant="destructive"
                      disabled={selectedOrders.size === 0}
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Selected ({selectedOrders.size})
                    </Button>
                    <Button
                      variant="outline"
                      disabled={selectedOrders.size === 0}
                      onClick={handleArchiveSelected}
                      className="flex items-center gap-2"
                    >
                      <Archive className="h-4 w-4" />
                      Archive Selected ({selectedOrders.size})
                    </Button>
                    <Button
                      variant="outline"
                      disabled={selectedOrders.size === 0}
                      onClick={handleExportSelected}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Export Selected ({selectedOrders.size})
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Confirm Delete
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-medium">
                  You are about to delete {selectedOrders.size} orders permanently.
                </p>
                <p className="text-red-600 text-sm mt-2">
                  This action cannot be undone.
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Orders to be deleted:</p>
                <div className="max-h-32 overflow-y-auto bg-gray-50 rounded p-2">
                  {filteredOrders
                    .filter(order => selectedOrders.has(order.id))
                    .map(order => (
                      <div key={order.id} className="text-xs text-gray-600 py-1">
                        #{order.id.slice(-8)} - {order.customer_name} - {formatAmount(order.total_amount)}
                      </div>
                    ))}
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteSelected}
                  disabled={isDeleting}
                  className="flex-1"
                >
                  {isDeleting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete {selectedOrders.size} Orders
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </div>
        </div>
      )}
    </div>
  )
}
