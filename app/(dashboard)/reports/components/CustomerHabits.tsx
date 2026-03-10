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
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="seenProductsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.3}/>
                </linearGradient>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.3}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
              <XAxis 
                dataKey="date" 
                stroke="#94a3b8" 
                fontSize={12}
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={12}
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
              />
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
                  name === 'seenProducts' ? 'Products Viewed' : 'Sales Made'
                ]}
              />
              <Bar 
                dataKey="seenProducts" 
                fill="url(#seenProductsGradient)"
                radius={[16, 16, 8, 8]}
                maxBarSize={65}
                animationBegin={0}
                animationDuration={1500}
                animationEasing="ease-out"
              />
              <Bar 
                dataKey="sales" 
                fill="url(#salesGradient)"
                radius={[16, 16, 8, 8]}
                maxBarSize={65}
                animationBegin={300}
                animationDuration={1500}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
})

CustomerHabits.displayName = 'CustomerHabits'
