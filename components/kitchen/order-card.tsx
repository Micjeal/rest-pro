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
    <Card className={`bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 rounded-2xl overflow-hidden group order-card relative ${
      timeWarning === 'critical' ? 'ring-2 ring-red-500 ring-opacity-50' : 
      timeWarning === 'warning' ? 'ring-2 ring-yellow-500 ring-opacity-50' : ''
    }`}>
      {/* Status Indicator Bar */}
      <div className={`h-2 ${getStatusColor(order.status || 'pending')} relative`}>
        <div 
          className={`h-full bg-white dark:bg-slate-900 transition-all duration-500 progress-bar`}
          style={{ '--progress': `${getProgressPercentage()}%` } as React.CSSProperties}
        />
      </div>
      
      {/* Selection Checkbox */}
      {showSelection && (
        <OrderCheckbox
          order={order}
          isSelected={isSelected}
          onToggle={onToggleSelection || (() => {})}
        />
      )}
      
      <CardHeader className="pb-4 bg-gradient-to-br from-gray-50 to-white dark:from-slate-800 dark:to-slate-900">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-full ${getStatusColor(order.status || 'pending')} bg-opacity-20 flex items-center justify-center`}>
              {order.status === 'pending' && <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />}
              {order.status === 'preparing' && <ChefHat className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
              {order.status === 'ready' && <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />}
              {order.status === 'completed' && <CheckCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  Order #{order.id?.substring(0, 6) || 'N/A'}
                </CardTitle>
                <PriorityBadge order={order} />
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {formatTime(order.created_at || new Date().toISOString())}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {getStatusBadge(order.status || 'pending')}
            
            {/* Timer Display */}
            <div className={`flex items-center gap-1 text-sm font-medium ${getTimeWarningColor()}`}>
              <Timer className="h-4 w-4" />
              <span className={timeWarning !== 'normal' ? 'animate-pulse' : ''}>
                {formatElapsedTime(elapsedTime)}
              </span>
              {timeWarning === 'critical' && (
                <AlertTriangle className="h-4 w-4 ml-1 animate-bounce" />
              )}
            </div>
          </div>
        </div>
        
        {/* Time Elapsed */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {formatElapsedTime(elapsedTime)} elapsed
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {order.status === 'pending' && 'Waiting to start'}
              {order.status === 'preparing' && 'In progress'}
              {order.status === 'ready' && 'Ready for pickup'}
              {order.status === 'completed' && 'Completed'}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Order Items */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wide">Order Items</h4>
            <div className="space-y-3">
              {order.items?.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-100 dark:border-slate-600">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{item.quantity}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                      {item.notes && (
                        <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">{item.notes}</p>
                      )}
                    </div>
                  </div>
                  {item.notes && (
                    <div className="text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-full border border-orange-200 dark:border-orange-800">
                      Note
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Customer Information */}
          {order.customer_name && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm uppercase tracking-wide mb-2">Customer Details</h4>
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  {order.customer_name}
                </p>
                {order.customer_phone && (
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {order.customer_phone}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {(order.status === 'pending' || order.status === 'preparing' || order.status === 'ready') && (
            <div className="space-y-3">
              {/* Primary Action Button */}
              {order.status === 'pending' && (
                <Button
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  onClick={() => onStatusUpdate(order.id, 'pending', 'preparing')}
                >
                  <ChefHat className="h-5 w-5 mr-2" />
                  Start Preparing
                </Button>
              )}
              
              {order.status === 'preparing' && (
                <Button
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  onClick={() => onStatusUpdate(order.id, 'preparing', 'ready')}
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Mark as Ready
                </Button>
              )}
              
              {order.status === 'ready' && (
                <div className="space-y-3">
                  <Button
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    onClick={() => onStatusUpdate(order.id, 'ready', 'completed')}
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Mark as Completed
                  </Button>
                  
                  <Button
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    onClick={handleServeAnnouncement}
                    disabled={isAnnouncing}
                  >
                    <Volume2 className="h-5 w-5 mr-2" />
                    {isAnnouncing ? 'Announcing...' : 'Announce Ready'}
                  </Button>
                </div>
              )}
              
              {/* Quick Stage Navigation */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <Button
                  variant={order.status === 'pending' ? 'default' : 'outline'}
                  size="sm"
                  className={`${order.status === 'pending' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white' : 'hover:bg-yellow-50 dark:hover:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300'} rounded-lg transition-all duration-200`}
                  onClick={() => onStatusUpdate(order.id, order.status, 'pending')}
                  disabled={order.status === 'pending'}
                >
                  Pending
                </Button>
                <Button
                  variant={order.status === 'preparing' ? 'default' : 'outline'}
                  size="sm"
                  className={`${order.status === 'preparing' ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white' : 'hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'} rounded-lg transition-all duration-200`}
                  onClick={() => onStatusUpdate(order.id, order.status, 'preparing')}
                  disabled={order.status === 'preparing'}
                >
                  Preparing
                </Button>
                <Button
                  variant={order.status === 'ready' ? 'default' : 'outline'}
                  size="sm"
                  className={`${order.status === 'ready' ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white' : 'hover:bg-green-50 dark:hover:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'} rounded-lg transition-all duration-200`}
                  onClick={() => onStatusUpdate(order.id, order.status, 'ready')}
                  disabled={order.status === 'ready'}
                >
                  Ready
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
