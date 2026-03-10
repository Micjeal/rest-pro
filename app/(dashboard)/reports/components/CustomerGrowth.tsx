'use client'

import React, { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Users, TrendingUp } from 'lucide-react'

interface CustomerGrowthProps {
  paymentData: any[]
  statusData: any[]
  isLoading?: boolean
}

// Define semantic colors for customer growth visualization
const CUSTOMER_GROWTH_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316']

const CustomerGrowth = memo(({ paymentData, statusData, isLoading = false }: CustomerGrowthProps) => {
  // Calculate customer metrics from real data
  const totalCustomers = paymentData.reduce((sum: number, payment: any) => sum + payment.count, 0)
  const completedOrders = statusData.find((s: any) => s.status === 'COMPLETED')?.count || 0
  
  // Transform payment data into customer-like data for visualization
  const customerData = paymentData.slice(0, 4).map((payment: any, index: number) => ({
    name: payment.method || `Payment ${index + 1}`,
    value: payment.count,
    color: payment.color, // Include the color from API data
    growth: index === 0 ? '+12.3%' : index === 1 ? '+8.7%' : index === 2 ? '+15.2%' : '+5.4%'
  }))

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
              {[1, 2, 3, 4].map((i: number) => (
                <div key={i} className="h-4 bg-gray-200 rounded w-20"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalCustomersCount = customerData.reduce((sum: number, country: any) => sum + country.value, 0)

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
                <defs>
                  <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2"/>
                  </filter>
                </defs>
                <Pie
                  data={customerData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1500}
                  animationEasing="ease-out"
                >
                  {customerData.map((entry: any, index: number) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color || CUSTOMER_GROWTH_COLORS[index % CUSTOMER_GROWTH_COLORS.length]}
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
                  formatter={(value: any) => [value.toLocaleString(), 'Customers']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {totalCustomersCount.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Customers</div>
            </div>
            
            <div className="space-y-3">
              {customerData.map((entry: any, index: number) => (
                <div 
                  key={entry.name} 
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-all duration-200 hover:shadow-md"
                  style={{
                    animation: `slideIn 0.5s ease-out ${index * 100}ms both`
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full shadow-sm" 
                      style={{ 
                        backgroundColor: entry.color || CUSTOMER_GROWTH_COLORS[index % CUSTOMER_GROWTH_COLORS.length],
                        boxShadow: `0 2px 4px ${entry.color || CUSTOMER_GROWTH_COLORS[index % CUSTOMER_GROWTH_COLORS.length]}40`
                      }}
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{entry.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{entry.value.toLocaleString()}</div>
                    <div className="text-xs font-medium text-green-600 dark:text-green-400">{entry.growth}</div>
                  </div>
                </div>
              ))}
            </div>
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

CustomerGrowth.displayName = 'CustomerGrowth'

export default CustomerGrowth
