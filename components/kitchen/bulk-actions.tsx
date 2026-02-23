'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CheckSquare, Square, Play, ChefHat, CheckCircle, XCircle, Volume2 } from 'lucide-react'
import type { KitchenOrder } from '@/hooks/use-kitchen-orders'
import { announceOrderReady } from '@/lib/text-to-speech'

interface BulkActionsProps {
  orders: KitchenOrder[]
  onUpdateMultipleOrders: (orderIds: string[], status: string) => Promise<void>
  onRefresh: () => void
}

export function BulkActions({ orders, onUpdateMultipleOrders, onRefresh }: BulkActionsProps) {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [bulkAction, setBulkAction] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders([...selectedOrders, orderId])
    } else {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(orders.map(order => order.id))
    } else {
      setSelectedOrders([])
    }
  }

  const handleBulkAction = async () => {
    if (!bulkAction || selectedOrders.length === 0) return

    setIsProcessing(true)
    try {
      await onUpdateMultipleOrders(selectedOrders, bulkAction)
      
      // Announce if marking orders as ready
      if (bulkAction === 'ready') {
        const readyOrders = orders.filter(order => selectedOrders.includes(order.id))
        for (const order of readyOrders) {
          const orderNumber = order.id?.substring(0, 6) || 'Unknown'
          await announceOrderReady(orderNumber, order.customer_name)
        }
      }
      
      setSelectedOrders([])
      setBulkAction('')
      onRefresh()
    } catch (error) {
      console.error('Bulk action failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const selectedOrdersData = orders.filter(order => selectedOrders.includes(order.id))
  const canSelectAll = orders.length > 0
  const allSelected = canSelectAll && selectedOrders.length === orders.length
  const someSelected = selectedOrders.length > 0 && !allSelected

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'preparing': return ChefHat
      case 'ready': return CheckCircle
      case 'completed': return CheckCircle
      case 'cancelled': return XCircle
      default: return Play
    }
  }

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'preparing': return 'Start Preparing'
      case 'ready': return 'Mark as Ready'
      case 'completed': return 'Mark as Completed'
      case 'cancelled': return 'Cancel Orders'
      default: return 'Bulk Action'
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Bulk Actions
            {selectedOrders.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {selectedOrders.length} selected
              </Badge>
            )}
          </CardTitle>
          
          {canSelectAll && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={allSelected}
                onCheckedChange={handleSelectAll}
                className="touch-target"
              />
              <Label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                Select All ({orders.length})
              </Label>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {selectedOrders.length > 0 && (
          <div className="space-y-3">
            {/* Selected Orders Summary */}
            <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
              <div className="text-sm font-medium mb-2">Selected Orders:</div>
              <div className="flex flex-wrap gap-2">
                {selectedOrdersData.map(order => (
                  <Badge key={order.id} variant="outline" className="text-xs">
                    #{order.id?.substring(0, 6)}
                  </Badge>
                ))}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Total items: {selectedOrdersData.reduce((sum, order) => sum + (order.items?.length || 0), 0)}
              </div>
            </div>

            {/* Bulk Action Controls */}
            <div className="flex items-center gap-3">
              <Select value={bulkAction} onValueChange={setBulkAction}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Choose action..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preparing">
                    <div className="flex items-center gap-2">
                      <ChefHat className="h-4 w-4" />
                      Start Preparing
                    </div>
                  </SelectItem>
                  <SelectItem value="ready">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Mark as Ready
                    </div>
                  </SelectItem>
                  <SelectItem value="completed">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Mark as Completed
                    </div>
                  </SelectItem>
                  <SelectItem value="cancelled">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4" />
                      Cancel Orders
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={handleBulkAction}
                disabled={!bulkAction || isProcessing}
                className="touch-target"
              >
                {isProcessing ? (
                  'Processing...'
                ) : (
                  <>
                    {bulkAction && getActionIcon(bulkAction) && (
                      <span className="mr-2">
                        {(() => {
                          const Icon = getActionIcon(bulkAction)
                          return <Icon className="h-4 w-4" />
                        })()}
                      </span>
                    )}
                    {bulkAction ? getActionLabel(bulkAction) : 'Select Action'}
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => setSelectedOrders([])}
                disabled={selectedOrders.length === 0}
              >
                Clear Selection
              </Button>
            </div>

            {/* Warning for destructive actions */}
            {bulkAction === 'cancelled' && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-300">
                  <strong>Warning:</strong> This will cancel {selectedOrders.length} order(s). This action cannot be undone.
                </p>
              </div>
            )}
          </div>
        )}

        {selectedOrders.length === 0 && (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            <Square className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Select orders to perform bulk actions</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Order selection checkbox component
export function OrderCheckbox({ 
  order, 
  isSelected, 
  onToggle 
}: { 
  order: KitchenOrder
  isSelected: boolean
  onToggle: (checked: boolean) => void 
}) {
  return (
    <div className="absolute top-3 left-3 z-10">
      <Checkbox
        checked={isSelected}
        onCheckedChange={onToggle}
        className="touch-target bg-white dark:bg-slate-800 border-2"
      />
    </div>
  )
}
