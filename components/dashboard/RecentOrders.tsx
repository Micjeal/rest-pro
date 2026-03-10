'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ShoppingCart, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ClearOrdersModal } from './ClearOrdersModal'
import { OrderManagementPanel } from './OrderManagementPanel'

interface RecentOrder {
  id: string
  name: string
  price: number
  date: string
  status: 'pending' | 'completed' | 'processing'
  image?: string
  created_at?: string
}

interface RecentOrdersProps {
  orders?: RecentOrder[]
  isLoading?: boolean
  currentUser?: {
    id: string
    role: string
  }
}

export function RecentOrders({ orders = [], isLoading = false, currentUser }: RecentOrdersProps) {
  // Only show real orders, no dummy data
  const ordersData = orders || []
  const [currentPage, setCurrentPage] = useState(0)
  const [eligibleOrdersCount, setEligibleOrdersCount] = useState(0)
  const [showClearModal, setShowClearModal] = useState(false)
  const [showManagementPanel, setShowManagementPanel] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const ordersPerPage = 3
  const totalPages = Math.ceil(ordersData.length / ordersPerPage)

  // Check if user has admin/manager role
  const canClearOrders = currentUser && ['admin', 'manager'].includes(currentUser.role)

  // Calculate eligible orders for clearing (completed + older than 7 days)
  useEffect(() => {
    if (!ordersData || ordersData.length === 0) {
      setEligibleOrdersCount(0)
      return
    }

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const eligibleOrders = ordersData.filter(order => 
      order.status === 'completed' && 
      order.created_at && 
      new Date(order.created_at) < sevenDaysAgo
    )

    setEligibleOrdersCount(eligibleOrders.length)
    
    // Debug logging
    console.log('[RecentOrders] Debug Info:', {
      currentUser: currentUser,
      userRole: currentUser?.role,
      canClearOrders,
      totalOrders: ordersData.length,
      eligibleOrders: eligibleOrders.length,
      sampleOrder: ordersData[0],
      sevenDaysAgo: sevenDaysAgo.toISOString()
    })
  }, [ordersData, currentUser, canClearOrders])

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

  const handleClearOrders = async () => {
    setIsClearing(true)
    
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch('/api/orders/bulk', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'completed',
          minAgeDays: 7,
          confirmation: 'DELETE'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to clear orders')
      }

      const result = await response.json()
      console.log('[RecentOrders] Orders cleared successfully:', result)
      
      // Refresh the page to show updated data
      window.location.reload()
      
    } catch (error) {
      console.error('[RecentOrders] Error clearing orders:', error)
      throw error
    } finally {
      setIsClearing(false)
    }
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
    <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 border-b border-gray-100 dark:border-gray-600">
        <CardTitle className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0">
              <span className="text-lg font-bold text-gray-900 dark:text-white">Recent Orders</span>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-normal">Latest customer orders</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end min-w-0">
            {/* Manage Orders Button - always visible for admin/manager */}
            {canClearOrders && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowManagementPanel(true)}
                className="flex items-center gap-1 px-2 py-1.5 text-xs bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex-shrink-0"
              >
                <Trash2 className="h-3 w-3" />
                <span className="hidden sm:inline">Manage</span>
              </Button>
            )}
            {/* Clear Orders Button - only when eligible orders exist */}
            {canClearOrders && eligibleOrdersCount > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowClearModal(true)}
                className="flex items-center gap-1 px-2 py-1.5 text-xs bg-red-500 hover:bg-red-600 transition-colors flex-shrink-0"
              >
                <Trash2 className="h-3 w-3" />
                <span className="hidden sm:inline">Clear</span>
                <span className="sm:hidden">{eligibleOrdersCount}</span>
                <span className="hidden sm:inline">Clear {eligibleOrdersCount}</span>
              </Button>
            )}
            {/* Debug Info - always show for admin/manager */}
            {canClearOrders && process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-500 bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded border border-yellow-300 dark:border-yellow-700 whitespace-nowrap">
                <span className="hidden sm:inline">Orders: {ordersData.length} | Eligible: {eligibleOrdersCount}</span>
                <span className="sm:hidden">{ordersData.length}/{eligibleOrdersCount}</span>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentPage === 0}
              className="p-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex-shrink-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentPage === totalPages - 1}
              className="p-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex-shrink-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {getCurrentOrders().map((order, index) => (
            <div
              key={order.id}
              className="group relative flex items-center p-4 bg-white dark:bg-gray-750 border border-gray-100 dark:border-gray-600 rounded-xl hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-200 cursor-pointer"
            >
              {/* Order Number Badge */}
              <div className="absolute -top-2 -left-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                #{index + 1}
              </div>
              
              {/* Order Image */}
              <div className="relative h-14 w-14 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700 rounded-xl overflow-hidden flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                {order.image ? (
                  <Image
                    src={order.image}
                    alt={order.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                    sizes="56px"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ShoppingCart className="h-7 w-7 text-gray-400 dark:text-gray-500" />
                  </div>
                )}
              </div>

              {/* Order Details */}
              <div className="flex-1 min-w-0 ml-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {order.name}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-medium text-green-600 dark:text-green-400">
                        {formatPrice(order.price)}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span>{order.date}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex-shrink-0 ml-3">
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${getStatusColor(order.status)} border border-current/10`}>
                  <div className={`w-2 h-2 rounded-full mr-1.5 ${
                    order.status === 'completed' ? 'bg-green-500' :
                    order.status === 'pending' ? 'bg-yellow-500' :
                    order.status === 'processing' ? 'bg-blue-500' :
                    'bg-gray-500'
                  }`} />
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Page Indicator */}
        <div className="flex justify-center items-center space-x-2 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              aria-label={`Go to page ${i + 1}`}
              aria-current={i === currentPage ? 'page' : undefined}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                i === currentPage
                  ? 'bg-blue-600 w-6 shadow-md'
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 hover:w-3'
              }`}
            />
          ))}
        </div>
      </CardContent>
      
      {/* Clear Orders Modal */}
      <ClearOrdersModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        eligibleOrdersCount={eligibleOrdersCount}
        onConfirm={handleClearOrders}
        isLoading={isClearing}
      />
      
      {/* Order Management Panel */}
      {currentUser && (
        <OrderManagementPanel
          isOpen={showManagementPanel}
          onClose={() => setShowManagementPanel(false)}
          currentUser={currentUser}
        />
      )}
    </Card>
  )
}
