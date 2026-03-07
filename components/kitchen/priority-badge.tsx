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
          className: 'border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-900/20 dark:text-violet-200',
          icon: Star,
          label: 'VIP',
        }
      case 'urgent':
        return {
          className: 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-200',
          icon: AlertTriangle,
          label: 'Urgent',
        }
      case 'high':
        return {
          className: 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200',
          icon: Zap,
          label: 'High',
        }
      case 'low':
        return {
          className: 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
          icon: Clock,
          label: 'Low',
        }
      default:
        return {
          className: 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-200',
          icon: Clock,
          label: 'Normal',
        }
    }
  }

  const config = getPriorityConfig()
  const Icon = config.icon

  return (
    <Badge 
      variant="outline"
      className={`flex items-center gap-1 border font-medium ${config.className} ${className}`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}
