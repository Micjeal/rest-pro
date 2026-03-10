'use client'

import React, { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { TrendingUp } from 'lucide-react'

interface ProductStatsProps {
  categoryData: any[]
  isLoading?: boolean
}

// Define semantic colors for product categories visualization
const PRODUCT_CATEGORY_COLORS = ['#f97316', '#06b6d4', '#ec4899', '#8b5cf6', '#10b981', '#ef4444', '#3b82f6', '#6b7280']

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
    color: PRODUCT_CATEGORY_COLORS[index % PRODUCT_CATEGORY_COLORS.length]
  }))

  const totalValue = categoryData.reduce((sum, item) => sum + item.value, 0)
  const totalItems = categoryData.reduce((sum, item) => sum + item.items, 0)

  return (
    <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-1.5 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-lg shadow-sm">
              <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            Product Statistics
          </CardTitle>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {totalItems.toLocaleString()}
            </div>
            <div className="text-sm font-medium text-green-600 dark:text-green-400">
              +{((totalValue / 10000) * 5.34).toFixed(2)}%
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {categoryData.map((item, index) => (
              <div 
                key={item.category} 
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-all duration-200 hover:shadow-md"
                style={{
                  animation: `slideIn 0.5s ease-out ${index * 100}ms both`
                }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full shadow-sm" 
                    style={{ 
                      backgroundColor: item.color || PRODUCT_CATEGORY_COLORS[index % PRODUCT_CATEGORY_COLORS.length],
                      boxShadow: `0 2px 4px ${item.color || PRODUCT_CATEGORY_COLORS[index % PRODUCT_CATEGORY_COLORS.length]}40`
                    }}
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.category}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{item.value.toLocaleString()}</div>
                  <div className="text-xs font-medium text-green-600 dark:text-green-400">
                    {index === 0 ? '+12.3%' : index === 1 ? '+8.7%' : index === 2 ? '+15.2%' : '+5.4%'}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <defs>
                  <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2"/>
                  </filter>
                </defs>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1500}
                  animationEasing="ease-out"
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      filter="url(#shadow)"
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: '16px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15), 0 4px 10px rgba(0,0,0,0.1)',
                    fontSize: '13px',
                    padding: '12px 16px',
                    backdropFilter: 'blur(8px)'
                  }}
                  labelStyle={{ color: '#e2e8f0', fontWeight: 500 }}
                  itemStyle={{ color: '#cbd5e1' }}
                  formatter={(value: any, name: any) => [
                    value.toLocaleString(), 
                    `${name} Sales`
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <style jsx>{`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}</style>
      </CardContent>
    </Card>
  )
})

ProductStats.displayName = 'ProductStats'
