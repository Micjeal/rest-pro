'use client'

import React, { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Users, TrendingUp } from 'lucide-react'

interface CustomerGrowthProps {
  isLoading?: boolean
}

const COUNTRY_COLORS = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4']

const countryData = [
  { name: 'United States', value: 287, growth: '+12.3%' },
  { name: 'Germany', value: 2417, growth: '+8.7%' },
  { name: 'Australia', value: 2281, growth: '+15.2%' },
  { name: 'France', value: 812, growth: '+5.4%' }
]

export const CustomerGrowth = memo(({ isLoading = false }: CustomerGrowthProps) => {
  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="pb-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded-full w-32"></div>
            </div>
            <div className="space-y-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-4 bg-gray-200 rounded w-20"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalCustomers = countryData.reduce((sum, country) => sum + country.value, 0)

  return (
    <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          Customer Growth
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={countryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {countryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COUNTRY_COLORS[index % COUNTRY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255,255,255,0.95)', 
                    border: '1px solid rgba(0,0,0,0.1)',
                    borderRadius: '8px'
                  }}
                  formatter={(value: any) => [value.toLocaleString(), 'Customers']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {totalCustomers.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Customers</div>
            </div>
            
            <div className="space-y-3">
              {countryData.map((country, index) => (
                <div key={country.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-sm font-medium">{country.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">{country.value.toLocaleString()}</div>
                    <div className="text-xs text-green-600">{country.growth}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

CustomerGrowth.displayName = 'CustomerGrowth'
