'use client'

import { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: LucideIcon
  trend?: {
    value: string
    isPositive: boolean
  }
  color?: string
  textColor?: string
  iconColor?: string
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
  textColor = 'text-gray-900 dark:text-white',
  iconColor = 'text-gray-600 dark:text-gray-400'
}: MetricCardProps) {
  return (
    <Card className={`${color} shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg bg-gray-50 dark:bg-gray-700`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
          {trend && (
            <div className={`text-sm font-medium flex items-center space-x-1 ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{trend.value}</span>
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <h3 className={`text-2xl font-bold ${textColor}`}>
            {value}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {subtitle}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
