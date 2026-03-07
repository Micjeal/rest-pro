'use client'

import React, { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Eye, ShoppingCart } from 'lucide-react'

interface CustomerHabitsProps {
  dailyData: any[]
  isLoading?: boolean
}

export const CustomerHabits = memo(({ dailyData, isLoading = false }: CustomerHabitsProps) => {
  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="pb-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    )
  }

  // Transform data for customer habits chart
  const chartData = dailyData.map(day => ({
    date: day.date,
    seenProducts: Math.floor(day.transactions * 1.3), // Simulated "seen products" data
    sales: day.transactions
  }))

  const totalSeen = chartData.reduce((sum, day) => sum + day.seenProducts, 0)
  const totalSold = chartData.reduce((sum, day) => sum + day.sales, 0)

  return (
    <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Eye className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          Customer Habits
        </CardTitle>
        <div className="flex gap-4 mt-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Seen product</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Sales</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {totalSeen.toLocaleString()}
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">Products Seen</div>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {totalSold.toLocaleString()}
            </div>
            <div className="text-sm text-green-700 dark:text-green-300">Products Sold</div>
          </div>
        </div>
        
        <div className="h-64 lg:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="#64748b" 
                fontSize={12}
                tick={{ fontSize: 10 }}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={12}
                tick={{ fontSize: 10 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255,255,255,0.95)', 
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '8px'
                }}
                formatter={(value: any, name: any) => [
                  value.toLocaleString(), 
                  name === 'seenProducts' ? 'Seen Products' : 'Sales'
                ]}
              />
              <Bar dataKey="seenProducts" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="sales" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
})

CustomerHabits.displayName = 'CustomerHabits'
