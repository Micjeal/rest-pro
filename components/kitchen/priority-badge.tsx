'use client'

import { Badge } from '@/components/ui/badge'
import { Star, Zap, AlertTriangle, Clock } from 'lucide-react'
import type { KitchenOrder } from '@/hooks/use-kitchen-orders'

interface PriorityBadgeProps {
  order: KitchenOrder
  className?: string
}

export function PriorityBadge({ order, className = '' }: PriorityBadgeProps) {
  const priority = order.priority || 'normal'
  
  const getPriorityConfig = () => {
    switch (priority) {
      case 'vip':
        return {
          variant: 'default' as const,
          className: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-600',
          icon: Star,
          label: 'VIP',
          pulse: true
        }
      case 'urgent':
        return {
          variant: 'destructive' as const,
          className: 'bg-gradient-to-r from-red-500 to-orange-500 text-white border-red-600',
          icon: AlertTriangle,
          label: 'Urgent',
          pulse: true
        }
      case 'high':
        return {
          variant: 'destructive' as const,
          className: 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-orange-600',
          icon: Zap,
          label: 'High',
          pulse: false
        }
      case 'low':
        return {
          variant: 'secondary' as const,
          className: 'bg-gray-100 text-gray-700 border-gray-300',
          icon: Clock,
          label: 'Low',
          pulse: false
        }
      default:
        return {
          variant: 'secondary' as const,
          className: 'bg-blue-100 text-blue-700 border-blue-300',
          icon: Clock,
          label: 'Normal',
          pulse: false
        }
    }
  }

  const config = getPriorityConfig()
  const Icon = config.icon

  return (
    <Badge 
      variant={config.variant} 
      className={`flex items-center gap-1 font-semibold ${config.className} ${className} ${
        config.pulse ? 'animate-pulse' : ''
      }`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}
