'use client'

import React, { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { TrendingUp } from 'lucide-react'

interface ProductStatsProps {
  categoryData: any[]
  isLoading?: boolean
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export const ProductStats = memo(({ categoryData, isLoading = false }: ProductStatsProps) => {
  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="pb-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="h-32 bg-gray-200 rounded-full w-32"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Transform data for circular chart
  const chartData = categoryData.map((item, index) => ({
    name: item.category,
    value: item.value,
    items: item.items,
    color: COLORS[index % COLORS.length]
  }))

  const totalValue = categoryData.reduce((sum, item) => sum + item.value, 0)
  const totalItems = categoryData.reduce((sum, item) => sum + item.items, 0)

  return (
    <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            Product Statistic
          </CardTitle>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {totalItems.toLocaleString()}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">
              +5.34%
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {categoryData.map((item, index) => (
              <div key={item.category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full bg-blue-500" 
                  />
                  <span className="text-sm font-medium">{item.category}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">{item.value.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">
                    {index === 0 ? '+1.8%' : index === 1 ? '+2.3%' : '-1.04%'}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255,255,255,0.95)', 
                    border: '1px solid rgba(0,0,0,0.1)',
                    borderRadius: '8px'
                  }}
                  formatter={(value: any) => [value.toLocaleString(), 'Sales']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

ProductStats.displayName = 'ProductStats'
