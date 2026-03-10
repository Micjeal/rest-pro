'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, ShoppingCart, TrendingUp, Eye } from 'lucide-react'

interface CustomerMetricsProps {
  onlineCustomers?: number
  inShopCustomers?: number
  isLoading?: boolean
}

export function CustomerMetrics({ 
  onlineCustomers = 3750,
  inShopCustomers = 5410,
  isLoading = false
}: CustomerMetricsProps) {
  // Use real data if provided, otherwise use defaults
  const onlineCount = onlineCustomers || 0
  const shopCount = inShopCustomers || 0
  const totalCustomers = onlineCount + shopCount
  const onlinePercentage = totalCustomers > 0 ? Math.round((onlineCount / totalCustomers) * 100) : 50
  const inShopPercentage = totalCustomers > 0 ? Math.round((shopCount / totalCustomers) * 100) : 50

  return (
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-gray-500" />
          <span className="text-lg font-semibold text-gray-900 dark:text-white">Your Customer</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Customer Numbers */}
          <div className="grid grid-cols-2 gap-4">
            {/* Online Customers */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {onlineCount.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Online</p>
            </div>

            {/* In-Shop Customers */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <ShoppingCart className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {shopCount.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">On Shop</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Online: {onlinePercentage}%</span>
              <span>In-Shop: {inShopPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div className="flex h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-500 transition-all duration-500"
                  style={{ width: `${onlinePercentage}%` }}
                ></div>
                <div 
                  className="bg-green-500 transition-all duration-500"
                  style={{ width: `${inShopPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">+12.5%</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">vs last month</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {totalCustomers.toLocaleString()}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Total Customers</p>
            </div>
          </div>

          {/* View More Button */}
          <Button variant="outline" className="w-full">
            View More
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
