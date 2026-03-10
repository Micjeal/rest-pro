'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'

interface OrderStatusCardsProps {
  todayOrders?: number
  completedOrders?: number
  pendingOrders?: number
  processingOrders?: number
  isLoading?: boolean
}

const weeklyData = [
  { day: 'Mon', orders: 12 },
  { day: 'Tue', orders: 19 },
  { day: 'Wed', orders: 15 },
  { day: 'Thu', orders: 25 },
  { day: 'Fri', orders: 22 },
  { day: 'Sat', orders: 28 },
  { day: 'Sun', orders: 18 }
]

export function OrderStatusCards({ 
  todayOrders = 28,
  completedOrders = 24,
  pendingOrders = 4,
  processingOrders = 0,
  isLoading = false
}: OrderStatusCardsProps) {
  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-900 dark:text-white">More →</span>
            <TrendingUp className="h-5 w-5 text-gray-500" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-900 dark:text-white">More →</span>
          <TrendingUp className="h-5 w-5 text-gray-500" />
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          station management features.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Order Status Cards */}
          <div className="grid grid-cols-1 gap-3">
            {/* Today's Orders */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Today's Order</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{todayOrders}</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/40 rounded-full p-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Completed Orders */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">Completed</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">{completedOrders}</p>
                </div>
                <div className="bg-green-100 dark:bg-green-900/40 rounded-full p-2">
                  <div className="w-6 h-6 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Pending Orders */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">Pending</p>
                  <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">{pendingOrders}</p>
                </div>
                <div className="bg-amber-100 dark:bg-amber-900/40 rounded-full p-2">
                  <div className="w-6 h-6 bg-amber-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Trend Chart */}
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="day" 
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                />
                <Bar 
                  dataKey="orders" 
                  fill="#3b82f6"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
