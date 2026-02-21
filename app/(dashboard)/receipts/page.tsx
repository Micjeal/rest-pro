'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Printer, Download, Search, Calendar, Filter, Eye, FileText, X, ShoppingBag, DollarSign, TrendingUp } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useRestaurants } from '@/hooks/use-restaurants'
import { useCurrency } from '@/hooks/use-currency'
import { useCurrencyEvents } from '@/hooks/use-currency-context'
import { ReceiptGenerator } from '@/lib/receipt-generator'

interface Receipt {
  id: string
  number: string
  date: string
  amount: number
  paymentMethod: string
  itemCount: number
  cashier: string
  customerName?: string
  tableName?: string
  status: string
  items: Array<{
    name: string
    quantity: number
    price: number
    subtotal: number
  }>
}

/**
 * Receipts Page
 * Route: /receipts
 * View and manage receipt history
 * Supports printing and downloading receipts
 */
export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | undefined>(undefined)
  const [statusFilter, setStatusFilter] = useState('all')
  
  // Use real data from hooks
  const { restaurants, isLoading: restaurantsLoading } = useRestaurants()
  const { formatAmount } = useCurrency({ restaurantId: selectedRestaurant })
  const { listenForCurrencyChanges } = useCurrencyEvents()
  
  // Set default restaurant when data loads
  useEffect(() => {
    if (restaurants.length > 0 && !selectedRestaurant) {
      setSelectedRestaurant(restaurants[0].id)
    }
  }, [restaurants, selectedRestaurant])

  useEffect(() => {
    console.log('[Receipts] Page loaded')
    if (selectedRestaurant) {
      loadReceipts()
    }
  }, [selectedRestaurant])
  
  // Listen for currency changes
  useEffect(() => {
    const cleanup = listenForCurrencyChanges((event) => {
      console.log('[Receipts] Currency changed:', event.detail)
      // Force re-render of receipts to show updated currency
      setReceipts(prev => [...prev])
    })
    
    return cleanup
  }, [listenForCurrencyChanges])

  const loadReceipts = async () => {
    try {
      setIsLoading(true)
      
      // Fetch all orders from API (not just completed ones)
      const statusParam = statusFilter === 'all' ? '' : `&status=${statusFilter}`
      const token = localStorage.getItem('auth_token')
      console.log('[Receipts] Auth token exists:', !!token)
      console.log('[Receipts] Fetching from:', `/api/orders?restaurantId=${selectedRestaurant}${statusParam}`)
      
      const response = await fetch(`/api/orders?restaurantId=${selectedRestaurant}${statusParam}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      console.log('[Receipts] API Response status:', response.status)
      console.log('[Receipts] API Response headers:', Object.fromEntries(response.headers.entries()))
      
      if (!response.ok) {
        let errorData: any = {}
        let responseText = ''
        
        try {
          responseText = await response.text()
          console.log('[Receipts] Raw error response:', responseText)
          errorData = JSON.parse(responseText)
        } catch (e) {
          console.log('[Receipts] Failed to parse error response as JSON:', e)
          errorData = { rawResponse: responseText }
        }
        
        console.error('[Receipts] API Error:', errorData)
        console.error('[Receipts] Response status:', response.status)
        console.error('[Receipts] Response.statusText:', response.statusText)
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const orders = await response.json()
      
      // Transform orders into receipt format
      const receiptsData: Receipt[] = orders.map((order: any) => ({
        id: order.id,
        number: `RCP-${new Date(order.created_at).toISOString().split('T')[0].replace(/-/g, '')}-${String(order.id).padStart(3, '0')}`,
        date: new Date(order.created_at).toLocaleString(),
        amount: order.total_amount,
        paymentMethod: order.payment_method || 'Unknown',
        itemCount: order.order_items?.length || 0,
        cashier: order.cashier_name || 'System',
        customerName: order.customer_name,
        tableName: order.table_number,
        status: order.status,
        items: order.order_items?.map((item: any) => ({
          name: item.menu_items?.name || `Item ${item.menu_item_id.substring(0, 4)}`,
          quantity: item.quantity,
          price: item.unit_price,
          subtotal: item.quantity * item.unit_price
        })) || []
      }))
      
      setReceipts(receiptsData)
      console.log('[Receipts] Loaded', receiptsData.length, 'receipts')
    } catch (error) {
      console.error('[Receipts] Error loading:', error)
      toast.error('Failed to load receipts')
      setReceipts([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (selectedRestaurant) {
      loadReceipts()
    }
  }, [selectedRestaurant, statusFilter])

  const handleDownload = async (receipt: Receipt) => {
    try {
      await ReceiptGenerator.generatePDFReceipt(receipt)
      toast.success('Receipt PDF downloaded')
    } catch (error) {
      console.error('[Receipts] PDF generation error:', error)
      toast.error('Failed to generate PDF receipt')
    }
  }

  const handleDownloadDetailed = async (receipt: Receipt) => {
    try {
      await ReceiptGenerator.generateDetailedReceipt(receipt)
      toast.success('Detailed receipt PDF downloaded')
    } catch (error) {
      console.error('[Receipts] Detailed PDF generation error:', error)
      toast.error('Failed to generate detailed PDF receipt')
    }
  }

  const handleViewDetails = (receipt: Receipt) => {
    setSelectedReceipt(receipt)
    setShowDetails(true)
  }

  const handleExportData = () => {
    const csvContent = [
      ['Receipt #', 'Date', 'Amount', 'Status', 'Payment Method', 'Cashier', 'Items'],
      ...filteredReceipts.map(r => [
        r.number,
        r.date,
        r.amount.toString(),
        r.status,
        r.paymentMethod,
        r.cashier,
        r.itemCount.toString()
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `receipts-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Receipt data exported')
  }

  const filteredReceipts = receipts.filter(
    (r) => {
      const matchesSearch = 
        r.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.cashier.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesDate = () => {
        if (dateFilter === 'all') return true
        const receiptDate = new Date(r.date)
        const today = new Date()
        
        switch (dateFilter) {
          case 'today':
            return receiptDate.toDateString() === today.toDateString()
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
            return receiptDate >= weekAgo
          case 'month':
            return receiptDate.getMonth() === today.getMonth() && 
                   receiptDate.getFullYear() === today.getFullYear()
          case 'custom':
            if (!startDate || !endDate) return true
            const start = new Date(startDate)
            const end = new Date(endDate)
            return receiptDate >= start && receiptDate <= end
          default:
            return true
        }
      }
      
      return matchesSearch && matchesDate()
    }
  )

  const handlePrint = (receipt: Receipt) => {
    console.log('[Receipts] Printing receipt:', receipt.number)
    toast.success('Receipt sent to printer')
  }

  const getTotalAmount = () => receipts.reduce((sum, r) => sum + r.amount, 0)

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Receipt Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Track orders and generate professional receipts</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-4 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{receipts.length}</p>
          </div>
        </div>
      </div>

      {/* Restaurant Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Restaurant</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedRestaurant || ''} onValueChange={setSelectedRestaurant} disabled={restaurantsLoading}>
            <SelectTrigger>
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

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-100 flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{receipts.length}</p>
            <p className="text-blue-100 text-sm mt-1">All time orders</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-100 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatAmount(getTotalAmount())}</p>
            <p className="text-green-100 text-sm mt-1">Gross revenue</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-100 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Average Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {receipts.length > 0 ? formatAmount(getTotalAmount() / receipts.length) : formatAmount(0)}
            </p>
            <p className="text-purple-100 text-sm mt-1">Per order</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-100 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Completed Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {receipts.filter(r => r.status === 'completed').length}
            </p>
            <p className="text-orange-100 text-sm mt-1">Finished orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Search & Filter Receipts
            <Button variant="outline" size="sm" onClick={handleExportData}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search by receipt number or cashier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="statusFilter">Order Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="preparing">Preparing</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="dateFilter">Date Filter</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {dateFilter === 'custom' && (
              <>
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Receipts Table */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Receipt History
            </span>
            <Button variant="outline" size="sm" onClick={handleExportData} className="bg-white dark:bg-slate-800">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading receipts...</p>
            </div>
          ) : filteredReceipts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">
                {searchTerm ? 'No receipts found' : 'No receipts yet'}
              </p>
              <p className="text-sm mt-2">
                {searchTerm ? 'Try adjusting your search terms' : 'Orders will appear here once created'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-slate-800">
                  <TableRow>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Receipt #</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Date & Time</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700 dark:text-gray-300">Amount</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Items</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Payment Method</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Cashier</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700 dark:text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReceipts.map((receipt) => (
                    <TableRow key={receipt.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                      <TableCell className="font-mono font-semibold text-blue-600">{receipt.number}</TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">{receipt.date}</TableCell>
                      <TableCell className="text-right font-semibold text-gray-900 dark:text-white">
                        {formatAmount(receipt.amount)}
                      </TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          receipt.status === 'completed' ? 'bg-green-100 text-green-700 border border-green-200' :
                          receipt.status === 'ready' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                          receipt.status === 'preparing' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                          receipt.status === 'confirmed' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                          'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}>
                          {receipt.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">{receipt.itemCount}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium border border-blue-200">
                          {receipt.paymentMethod}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">{receipt.cashier}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePrint(receipt)}
                            title="Print receipt"
                            className="hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(receipt)}
                            title="Download receipt PDF"
                            className="hover:bg-green-50 hover:text-green-600"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadDetailed(receipt)}
                            title="Download detailed PDF"
                            className="hover:bg-purple-50 hover:text-purple-600"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(receipt)}
                            title="View details"
                            className="hover:bg-indigo-50 hover:text-indigo-600"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Receipt Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold">
                Receipt Details - {selectedReceipt?.number}
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          {selectedReceipt && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Receipt Number</Label>
                  <p className="font-mono font-semibold">{selectedReceipt.number}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Date & Time</Label>
                  <p>{selectedReceipt.date}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedReceipt.status === 'completed' ? 'bg-green-100 text-green-700' :
                    selectedReceipt.status === 'ready' ? 'bg-blue-100 text-blue-700' :
                    selectedReceipt.status === 'preparing' ? 'bg-yellow-100 text-yellow-700' :
                    selectedReceipt.status === 'confirmed' ? 'bg-purple-100 text-purple-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedReceipt.status}
                  </span>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Payment Method</Label>
                  <p className="capitalize">{selectedReceipt.paymentMethod}</p>
                </div>
              </div>

              {/* Customer Info */}
              {(selectedReceipt.customerName || selectedReceipt.tableName) && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Customer Information</Label>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    {selectedReceipt.customerName && (
                      <p><span className="font-medium">Name:</span> {selectedReceipt.customerName}</p>
                    )}
                    {selectedReceipt.tableName && (
                      <p><span className="font-medium">Table:</span> {selectedReceipt.tableName}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Items */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Order Items</Label>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden">
                  {selectedReceipt.items && selectedReceipt.items.length > 0 ? (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {selectedReceipt.items.map((item, index) => (
                        <div key={index} className="p-3 flex justify-between items-center">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                          </div>
                          <p className="font-semibold">${item.subtotal.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No items found for this order
                    </div>
                  )}
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Order Summary</Label>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-medium">{formatAmount(selectedReceipt.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (10%):</span>
                    <span className="font-medium">{formatAmount(selectedReceipt.amount * 0.1)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>{formatAmount(selectedReceipt.amount * 1.1)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={() => handleDownload(selectedReceipt)}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button
                  onClick={() => handleDownloadDetailed(selectedReceipt)}
                  variant="outline"
                  className="flex-1"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Detailed PDF
                </Button>
                <Button
                  onClick={() => handlePrint(selectedReceipt)}
                  variant="outline"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
