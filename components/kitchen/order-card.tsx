'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, ChefHat, CheckCircle, XCircle, Volume2, Timer, User, AlertTriangle } from 'lucide-react'
import type { KitchenOrder } from '@/hooks/use-kitchen-orders'
import { announceOrderReady } from '@/lib/text-to-speech'
import { useState, useEffect } from 'react'
import { PriorityBadge } from './priority-badge'
import { OrderCheckbox } from './bulk-actions'

interface OrderCardProps {
  order: KitchenOrder
  onStatusUpdate: (orderId: string, currentStatus: string, targetStatus?: string) => Promise<void>
  isSelected?: boolean
  onToggleSelection?: (checked: boolean) => void
  showSelection?: boolean
}

export function OrderCard({ order, onStatusUpdate, isSelected = false, onToggleSelection, showSelection = false }: OrderCardProps) {
  const [isAnnouncing, setIsAnnouncing] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [timeWarning, setTimeWarning] = useState<'normal' | 'warning' | 'critical'>('normal')

  // Calculate elapsed time and warnings
  useEffect(() => {
    const startTime = new Date(order.created_at || new Date()).getTime()
    const interval = setInterval(() => {
      const now = Date.now()
      const elapsed = Math.floor((now - startTime) / 1000) // seconds
      setElapsedTime(elapsed)
      
      // Set warnings based on elapsed time and order status
      if (order.status === 'pending' && elapsed > 600) { // 10 minutes
        setTimeWarning('critical')
      } else if (order.status === 'pending' && elapsed > 300) { // 5 minutes
        setTimeWarning('warning')
      } else if (order.status === 'preparing' && elapsed > 1200) { // 20 minutes
        setTimeWarning('critical')
      } else if (order.status === 'preparing' && elapsed > 900) { // 15 minutes
        setTimeWarning('warning')
      } else {
        setTimeWarning('normal')
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [order.created_at, order.status])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500'
      case 'preparing': return 'bg-blue-500'
      case 'ready': return 'bg-green-500'
      case 'completed': return 'bg-gray-500'
      default: return 'bg-gray-400'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case 'preparing':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
            <ChefHat className="h-3 w-3 mr-1" />
            Preparing
          </Badge>
        )
      case 'ready':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Ready
          </Badge>
        )
      case 'completed':
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary">Unknown</Badge>
        )
    }
  }

  const getNextActionText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Start Preparing'
      case 'preparing':
        return 'Mark as Ready'
      case 'ready':
        return 'Mark as Completed'
      default:
        return 'Update Status'
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const formatElapsedTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getProgressPercentage = () => {
    const statusFlow = ['pending', 'preparing', 'ready', 'completed']
    const currentIndex = statusFlow.indexOf(order.status || 'pending')
    return ((currentIndex + 1) / statusFlow.length) * 100
  }

  const getProgressClass = () => {
    const percentage = getProgressPercentage()
    if (percentage <= 25) return 'progress-25'
    if (percentage <= 50) return 'progress-50'
    if (percentage <= 75) return 'progress-75'
    return 'progress-100'
  }

  const getTimeWarningColor = () => {
    switch (timeWarning) {
      case 'critical': return 'text-red-500'
      case 'warning': return 'text-yellow-500'
      default: return 'text-gray-500'
    }
  }

  const handleServeAnnouncement = async () => {
    if (isAnnouncing) return;
    
    setIsAnnouncing(true);
    try {
      const orderNumber = order.id?.substring(0, 6) || 'Unknown';
      await announceOrderReady(orderNumber, order.customer_name);
    } catch (error) {
      console.error('Error announcing order:', error);
    } finally {
      setIsAnnouncing(false);
    }
  }

  return (
    <Card className={`bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 rounded-xl overflow-hidden group order-card relative w-full touch-manipulation ${
      timeWarning === 'critical' ? 'ring-2 ring-red-500 ring-opacity-50' : 
      timeWarning === 'warning' ? 'ring-2 ring-yellow-500 ring-opacity-50' : ''
    }`}>
      {/* Status Indicator Bar */}
      <div className={`h-1 ${getStatusColor(order.status || 'pending')} relative`}>
        <div className={`h-full bg-white dark:bg-slate-900 transition-all duration-500 progress-bar ${getProgressClass()}`} />
      </div>
      
      <CardHeader className="pb-3 bg-gradient-to-br from-gray-50 to-white dark:from-slate-800 dark:to-slate-900">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-base font-bold text-gray-900 dark:text-white truncate">
                #{order.id?.substring(0, 6) || 'N/A'}
              </CardTitle>
              {getStatusBadge(order.status || 'pending')}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {formatTime(order.created_at || new Date().toISOString())}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">
              {order.customer_name || 'Customer'}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {/* Timer Display */}
            <div className={`flex items-center gap-1 text-xs font-medium ${getTimeWarningColor()}`}>
              <Timer className="h-3 w-3" />
              <span className={timeWarning !== 'normal' ? 'animate-pulse' : ''}>
                {formatElapsedTime(elapsedTime)}
              </span>
              {timeWarning === 'critical' && (
                <AlertTriangle className="h-3 w-3" />
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-3">
        <div className="space-y-3">
          {/* Order Items - Compact */}
          <div className="space-y-2">
            <h4 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wide">Items</h4>
            <div className="space-y-1">
              {order.items?.slice(0, 3).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-full flex items-center justify-center border border-orange-300 dark:border-orange-700">
                      <span className="text-xs font-bold text-orange-600 dark:text-orange-400">{item.quantity}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                        {item.name}
                      </p>
                      {item.notes && (
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 truncate">
                          📝 {item.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {order.items && order.items.length > 3 && (
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-1">
                  +{order.items.length - 3} more items
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons - Streamlined */}
          <div className="space-y-2">
            {/* Primary Action Button */}
            {order.status === 'pending' && (
              <Button
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-2 rounded-lg shadow transition-all duration-300 transform hover:scale-105 text-sm touch-manipulation"
                onClick={() => onStatusUpdate(order.id, 'pending', 'preparing')}
              >
                <ChefHat className="h-4 w-4 mr-2" />
                Start Preparing
              </Button>
            )}
            
            {order.status === 'preparing' && (
              <Button
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold py-2 rounded-lg shadow transition-all duration-300 transform hover:scale-105 text-sm touch-manipulation"
                onClick={() => onStatusUpdate(order.id, 'preparing', 'ready')}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark Ready
              </Button>
            )}
            
            {order.status === 'ready' && (
              <div className="space-y-2">
                <Button
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-2 rounded-lg shadow transition-all duration-300 transform hover:scale-105 text-sm touch-manipulation"
                  onClick={() => onStatusUpdate(order.id, 'ready', 'completed')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete
                </Button>
                <Button
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-2 rounded-lg shadow transition-all duration-300 transform hover:scale-105 text-xs touch-manipulation"
                  onClick={handleServeAnnouncement}
                  disabled={isAnnouncing}
                >
                  <Volume2 className="h-3 w-3 mr-1" />
                  {isAnnouncing ? 'Announcing...' : 'Announce'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
