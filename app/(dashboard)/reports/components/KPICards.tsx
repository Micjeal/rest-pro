'use client'

import React, { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Users, ShoppingCart, DollarSign } from 'lucide-react'

interface KPICardsProps {
  totalRevenue: number
  totalOrders: number
  totalTransactions: number
  averageTransaction: number
  formatAmount: (amount: number) => string
  isLoading?: boolean
}

export const KPICards = memo(({ 
  totalRevenue, 
  totalOrders, 
  totalTransactions, 
  averageTransaction,
  formatAmount,
  isLoading = false 
}: KPICardsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const kpiData = [
    {
      title: 'Total Sales',
      value: formatAmount(totalRevenue),
      subtitle: 'All sales',
      icon: DollarSign,
      color: 'from-blue-500/10 to-blue-600/5 border-blue-200/50 dark:border-blue-800/30',
      textColor: 'text-blue-700 dark:text-blue-300',
      iconColor: 'text-blue-600 dark:text-blue-400',
      change: '+2.08%'
    },
    {
      title: 'Total Orders',
      value: totalOrders.toLocaleString(),
      subtitle: 'Completed orders',
      icon: ShoppingCart,
      color: 'from-emerald-500/10 to-emerald-600/5 border-emerald-200/50 dark:border-emerald-800/30',
      textColor: 'text-emerald-700 dark:text-emerald-300',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      change: '+12.4%'
    },
    {
      title: 'Visitors',
      value: totalTransactions.toLocaleString(),
      subtitle: 'Unique customers',
      icon: Users,
      color: 'from-orange-500/10 to-orange-600/5 border-orange-200/50 dark:border-orange-800/30',
      textColor: 'text-orange-700 dark:text-orange-300',
      iconColor: 'text-orange-600 dark:text-orange-400',
      change: '-2.08%'
    },
    {
      title: 'Avg Order Value',
      value: formatAmount(averageTransaction),
      subtitle: 'Per transaction',
      icon: TrendingUp,
      color: 'from-purple-500/10 to-purple-600/5 border-purple-200/50 dark:border-purple-800/30',
      textColor: 'text-purple-700 dark:text-purple-300',
      iconColor: 'text-purple-600 dark:text-purple-400',
      change: '+12.1%'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {kpiData.map((kpi, index) => {
        const Icon = kpi.icon
        return (
          <Card 
            key={kpi.title}
            className={`bg-gradient-to-br ${kpi.color} card-hover shadow-lg hover:shadow-lg transition-all duration-300`}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <div className="p-1.5 bg-white/20 rounded-lg">
                    <Icon className={`h-4 w-4 ${kpi.iconColor}`} />
                  </div>
                  {kpi.title}
                </div>
                <span className={`text-xs font-medium ${
                  kpi.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {kpi.change}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className={`text-2xl lg:text-3xl font-bold ${kpi.textColor}`}>
                  {kpi.value}
                </p>
                <p className="text-xs opacity-70">
                  {kpi.subtitle}
                </p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
})

KPICards.displayName = 'KPICards'
