'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ImagePreview } from '@/components/ui/image-preview'
import { Clock, ChefHat, CheckCircle, XCircle, Volume2, Timer, AlertTriangle } from 'lucide-react'
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
  const currentStatus = order.status || 'pending'

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
      case 'pending': return 'bg-amber-500'
      case 'preparing': return 'bg-blue-500'
      case 'ready': return 'bg-emerald-500'
      case 'completed': return 'bg-slate-500'
      case 'cancelled': return 'bg-rose-500'
      default: return 'bg-slate-400'
    }
  }

  const getStatusTone = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          iconWrap: 'bg-amber-100 dark:bg-amber-900/30',
          icon: 'text-amber-700 dark:text-amber-300',
          border: 'border-amber-200/70 dark:border-amber-800/70',
        }
      case 'preparing':
        return {
          iconWrap: 'bg-blue-100 dark:bg-blue-900/30',
          icon: 'text-blue-700 dark:text-blue-300',
          border: 'border-blue-200/70 dark:border-blue-800/70',
        }
      case 'ready':
        return {
          iconWrap: 'bg-emerald-100 dark:bg-emerald-900/30',
          icon: 'text-emerald-700 dark:text-emerald-300',
          border: 'border-emerald-200/70 dark:border-emerald-800/70',
        }
      case 'completed':
        return {
          iconWrap: 'bg-slate-100 dark:bg-slate-800/80',
          icon: 'text-slate-700 dark:text-slate-300',
          border: 'border-slate-200/70 dark:border-slate-700/80',
        }
      case 'cancelled':
        return {
          iconWrap: 'bg-rose-100 dark:bg-rose-900/30',
          icon: 'text-rose-700 dark:text-rose-300',
          border: 'border-rose-200/70 dark:border-rose-800/70',
        }
      default:
        return {
          iconWrap: 'bg-slate-100 dark:bg-slate-800/80',
          icon: 'text-slate-700 dark:text-slate-300',
          border: 'border-slate-200/70 dark:border-slate-700/80',
        }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case 'preparing':
        return (
          <Badge variant="outline" className="border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
            <ChefHat className="h-3 w-3 mr-1" />
            Preparing
          </Badge>
        )
      case 'ready':
        return (
          <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Ready
          </Badge>
        )
      case 'completed':
        return (
          <Badge variant="outline" className="border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge variant="outline" className="border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-200">
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
      case 'critical': return 'text-rose-600 dark:text-rose-300'
      case 'warning': return 'text-amber-600 dark:text-amber-300'
      default: return 'text-slate-500 dark:text-slate-400'
    }
  }

  const getStageButtonClass = (stage: 'pending' | 'preparing' | 'ready') => {
    const isActive = currentStatus === stage

    if (stage === 'pending') {
      return isActive
        ? 'bg-amber-600 border-amber-600 text-white hover:bg-amber-700'
        : 'border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-900/20'
    }

    if (stage === 'preparing') {
      return isActive
        ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'
        : 'border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/20'
    }

    return isActive
      ? 'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700'
      : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/20'
  }

  const statusTone = getStatusTone(currentStatus)
  const cardWarningRing =
    timeWarning === 'critical'
      ? 'ring-1 ring-rose-300 dark:ring-rose-700'
      : timeWarning === 'warning'
        ? 'ring-1 ring-amber-300 dark:ring-amber-700'
        : ''

  const progressPercentage = getProgressPercentage()

  const renderStatusIcon = () => {
    if (currentStatus === 'pending') return <Clock className={`h-5 w-5 ${statusTone.icon}`} />
    if (currentStatus === 'preparing') return <ChefHat className={`h-5 w-5 ${statusTone.icon}`} />
    if (currentStatus === 'ready') return <CheckCircle className={`h-5 w-5 ${statusTone.icon}`} />
    if (currentStatus === 'completed') return <CheckCircle className={`h-5 w-5 ${statusTone.icon}`} />
    if (currentStatus === 'cancelled') return <XCircle className={`h-5 w-5 ${statusTone.icon}`} />
    return <Clock className={`h-5 w-5 ${statusTone.icon}`} />
  }

  const renderPrimaryAction = () => {
    if (currentStatus === 'pending') {
      return (
        <Button
          className="w-full rounded-lg border border-amber-600 bg-amber-600 py-3 text-sm font-semibold text-white hover:bg-amber-700"
          onClick={() => onStatusUpdate(order.id, 'pending', 'preparing')}
        >
          <ChefHat className="h-4 w-4 mr-2" />
          Start Preparing
        </Button>
      )
    }

    if (currentStatus === 'preparing') {
      return (
        <Button
          className="w-full rounded-lg border border-blue-600 bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          onClick={() => onStatusUpdate(order.id, 'preparing', 'ready')}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Mark as Ready
        </Button>
      )
    }

    if (currentStatus === 'ready') {
      return (
        <div className="space-y-2.5">
          <Button
            className="w-full rounded-lg border border-emerald-600 bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
            onClick={() => onStatusUpdate(order.id, 'ready', 'completed')}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark as Completed
          </Button>

          <Button
            variant="outline"
            className="w-full rounded-lg border-slate-300 bg-white py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            onClick={handleServeAnnouncement}
            disabled={isAnnouncing}
          >
            <Volume2 className="h-4 w-4 mr-2" />
            {isAnnouncing ? 'Announcing...' : 'Announce Ready'}
          </Button>
        </div>
      )
    }

    return null
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
    <Card className={`relative w-full overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow duration-200 hover:shadow-md dark:bg-slate-900 ${statusTone.border} ${cardWarningRing}`}>
      <div className="h-1.5 bg-slate-100 dark:bg-slate-800">
        <div
          className={`h-full ${getStatusColor(currentStatus)} transition-[width] duration-500`}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {showSelection && (
        <OrderCheckbox
          order={order}
          isSelected={isSelected}
          onToggle={onToggleSelection || (() => {})}
        />
      )}

      <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${statusTone.iconWrap}`}>
              {renderStatusIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                  Order #{order.id?.substring(0, 6) || 'N/A'}
                </CardTitle>
                <PriorityBadge order={order} />
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {formatTime(order.created_at || new Date().toISOString())}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {getStatusBadge(currentStatus)}
            <div className={`flex items-center gap-1 text-sm font-medium ${getTimeWarningColor()}`}>
              <Timer className="h-4 w-4" />
              <span>{formatElapsedTime(elapsedTime)}</span>
              {timeWarning === 'critical' && (
                <AlertTriangle className="h-4 w-4 ml-1" />
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Order Notes Section */}
      {order.notes && (
        <div className="mx-4 mb-4 rounded-lg border-2 border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
          <div className="flex items-start gap-2">
            <div className="h-5 w-5 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-200">!</span>
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-800 dark:text-amber-200 mb-1">
                Order Instructions
              </h4>
              <p className="text-sm text-amber-900 dark:text-amber-100 font-medium">
                {order.notes}
              </p>
            </div>
          </div>
        </div>
      )}

      <CardContent className="p-4 lg:p-5">
        <div className="space-y-5">
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Order Items</h4>
            <div className="space-y-2.5">
              {order.items?.map((item, index) => (
                <div key={index} className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-700 dark:bg-slate-800/50">
                  <div className="flex items-start gap-3">
                    {/* Image Area */}
                    <div className="h-16 w-16 shrink-0 rounded-lg border border-slate-300 bg-gray-50 overflow-hidden">
                      {item.image_url ? (
                        <ImagePreview
                          src={item.image_url}
                          alt={item.name}
                          size="sm"
                          fullWidth={true}
                          className="w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <div className="text-center">
                            <div className="text-lg mb-1">🍽️</div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Content Area */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-base leading-tight text-slate-900 dark:text-slate-100">
                        {item.name}
                      </p>
                      {item.description && (
                        <p className="mt-2 border-l-2 border-slate-300 pl-2 text-sm text-slate-600 dark:border-slate-600 dark:text-slate-300">
                          Prep: {item.description}
                        </p>
                      )}
                      {item.notes && (
                        <p className="mt-2 border-l-2 border-amber-300 pl-2 text-sm text-amber-700 dark:border-amber-700 dark:text-amber-300">
                          Note: {item.notes}
                        </p>
                      )}
                    </div>
                    
                    {/* Quantity Badge */}
                    <div className="h-10 w-10 shrink-0 rounded-full border border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 flex items-center justify-center text-sm font-semibold">
                      {item.quantity}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {(currentStatus === 'pending' || currentStatus === 'preparing' || currentStatus === 'ready') && (
            <div className="space-y-3">
              {renderPrimaryAction()}

              <div className="grid grid-cols-3 gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className={`rounded-md text-xs font-medium transition-colors ${getStageButtonClass('pending')}`}
                  onClick={() => onStatusUpdate(order.id, currentStatus, 'pending')}
                  disabled={currentStatus === 'pending'}
                >
                  Pending
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={`rounded-md text-xs font-medium transition-colors ${getStageButtonClass('preparing')}`}
                  onClick={() => onStatusUpdate(order.id, currentStatus, 'preparing')}
                  disabled={currentStatus === 'preparing'}
                >
                  Preparing
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={`rounded-md text-xs font-medium transition-colors ${getStageButtonClass('ready')}`}
                  onClick={() => onStatusUpdate(order.id, currentStatus, 'ready')}
                  disabled={currentStatus === 'ready'}
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
