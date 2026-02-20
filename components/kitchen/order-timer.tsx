'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Clock, Timer, AlertTriangle } from 'lucide-react'
import type { KitchenOrder } from '@/hooks/use-kitchen-orders'

interface OrderTimerProps {
  order: KitchenOrder
  className?: string
}

export function OrderTimer({ order, className = '' }: OrderTimerProps) {
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isOverdue, setIsOverdue] = useState(false)

  useEffect(() => {
    const startTime = new Date(order.created_at).getTime()
    const interval = setInterval(() => {
      const now = Date.now()
      const elapsed = Math.floor((now - startTime) / 1000) // seconds
      setElapsedTime(elapsed)
      
      // Mark as overdue after 30 minutes (1800 seconds)
      setIsOverdue(elapsed > 1800)
    }, 1000)

    return () => clearInterval(interval)
  }, [order.created_at])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  const getTimerColor = () => {
    if (isOverdue) return 'bg-red-100 text-red-800 border-red-200'
    if (elapsedTime > 900) return 'bg-yellow-100 text-yellow-800 border-yellow-200' // 15 minutes
    return 'bg-green-100 text-green-800 border-green-200'
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge className={getTimerColor()}>
        <Clock className="h-3 w-3 mr-1" />
        {formatTime(elapsedTime)}
      </Badge>
      {isOverdue && (
        <Badge variant="destructive" className="animate-pulse">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Overdue
        </Badge>
      )}
    </div>
  )
}
