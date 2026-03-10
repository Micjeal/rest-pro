'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import Image from 'next/image'

interface RecentOrder {
  id: string
  name: string
  price: number
  date: string
  status: 'pending' | 'completed' | 'processing'
  image?: string
}

interface RecentOrdersProps {
  orders?: RecentOrder[]
  isLoading?: boolean
}

export function RecentOrders({ orders = [], isLoading = false }: RecentOrdersProps) {
  // Only show real orders, no dummy data
  const ordersData = orders || []
  const [currentPage, setCurrentPage] = useState(0)
  const ordersPerPage = 3
  const totalPages = Math.ceil(ordersData.length / ordersPerPage)

  const getCurrentOrders = () => {
    const start = currentPage * ordersPerPage
    return ordersData.slice(start, start + ordersPerPage)
  }

  const handlePrevious = () => {
    setCurrentPage(prev => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`
  }

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-900 dark:text-white">Recent Order</span>
            <div className="flex items-center space-x-2">
              <div className="animate-pulse h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="animate-pulse h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="h-12 w-12 bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-900 dark:text-white">Recent Order</span>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentPage === 0}
              className="p-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentPage === totalPages - 1}
              className="p-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {getCurrentOrders().map((order) => (
            <div
              key={order.id}
              className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {/* Order Image */}
              <div className="relative h-12 w-12 bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden flex-shrink-0">
                {order.image ? (
                  <Image
                    src={order.image}
                    alt={order.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ShoppingCart className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Order Details */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 dark:text-white truncate">
                  {order.name}
                </h4>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>{formatPrice(order.price)}</span>
                  <span>•</span>
                  <span>{order.date}</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex-shrink-0">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Page Indicator */}
        <div className="flex justify-center items-center space-x-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              aria-label={`Go to page ${i + 1}`}
              aria-current={i === currentPage ? 'page' : undefined}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === currentPage
                  ? 'bg-blue-600'
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
              }`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
