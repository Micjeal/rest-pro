'use client'

import { useState, useEffect } from 'react'
import { useKitchenOrders } from '@/hooks/use-kitchen-orders'
import { KitchenDisplay } from '@/components/kitchen/kitchen-display'
import { useToast } from '@/hooks/use-toast'
import { Shield, ChefHat, Clock, TrendingUp, Users, ArrowRight } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRestaurants } from '@/hooks/use-restaurants'
import { Badge } from '@/components/ui/badge'
import { ThemeProvider } from '@/contexts/theme-context'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Button } from '@/components/ui/button'
import { getRolesByCategory } from '@/components/users/role-definitions'
import { DashboardLayout } from '@/components/dashboard-layout'

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic'

export default function KitchenPage() {
  const [userRole, setUserRole] = useState<string>('')
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | undefined>(undefined as string | undefined)
  const [currentTime, setCurrentTime] = useState(new Date())
  const router = useRouter()
  const { toast } = useToast()
  
  // Get kitchen roles for access control
  const kitchenRoles = getRolesByCategory('Kitchen').map(r => r.value)
  const managementRoles = getRolesByCategory('Management').map(r => r.value)
  
  // Use real data from hooks
  const { restaurants, isLoading: restaurantsLoading } = useRestaurants()
  const { orders } = useKitchenOrders(selectedRestaurant)

  useEffect(() => {
    console.log('[Kitchen Page] Component mounting...')
    // Only access localStorage on client side
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('userRole')
      console.log('[Kitchen Page] User role from localStorage:', role)
      
      // Set role immediately with default if none exists
      const finalRole = role || 'line_cook' // Default to line_cook
      setUserRole(finalRole)
      
      console.log('[Kitchen Page] Final role set to:', finalRole)
      console.log('[Kitchen Page] Kitchen roles:', kitchenRoles)
      console.log('[Kitchen Page] Management roles:', managementRoles)
      
      // Check access
      const allowedRoles = [...kitchenRoles, ...managementRoles, 'admin', 'manager', 'cashier', 'server', 'line_cook']
      if (!allowedRoles.includes(finalRole as any)) {
        console.log('[Kitchen Page] Access denied - role not in allowed list')
        toast({
          title: 'Access Denied',
          description: 'Only kitchen staff can access the kitchen display.',
          variant: 'destructive'
        })
        router.push('/dashboard')
        return
      } else {
        console.log('[Kitchen Page] Access granted for role:', finalRole)
      }
    }
  }, []) // Remove dependencies to run only once

  // Set default restaurant when data loads
  useEffect(() => {
    console.log('[Kitchen Page] Restaurants:', restaurants)
    console.log('[Kitchen Page] Restaurants loading:', restaurantsLoading)
    console.log('[Kitchen Page] Selected restaurant:', selectedRestaurant)
    
    // Quick fix: Use known restaurant ID if restaurants fail to load
    if (!restaurantsLoading && restaurants.length === 0 && !selectedRestaurant) {
      console.log('[Kitchen Page] No restaurants from API, using fallback restaurant ID')
      setSelectedRestaurant('31b0bb90-e0b4-4f85-9ef0-bac4e6bdea0c')
      return
    }
    
    if (!restaurantsLoading && restaurants.length > 0 && !selectedRestaurant) {
      const firstRestaurant = restaurants[0]
      console.log('[Kitchen Page] Setting default restaurant:', firstRestaurant)
      setSelectedRestaurant(firstRestaurant.id)
    }
  }, [restaurants, selectedRestaurant, restaurantsLoading])

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const getKitchenStats = () => {
    console.log('[Kitchen Page] Calculating stats from orders:', orders)
    const pending = orders.filter(o => o.status === 'pending').length
    const preparing = orders.filter(o => o.status === 'preparing').length
    const ready = orders.filter(o => o.status === 'ready').length
    const total = orders.length
    const stats = { pending, preparing, ready, total }
    console.log('[Kitchen Page] Calculated stats:', stats)
    return stats
  }

  const stats = getKitchenStats()

  console.log('[Kitchen Page] Rendering with userRole:', userRole)
  console.log('[Kitchen Page] Rendering with selectedRestaurant:', selectedRestaurant)

  if (!userRole) {
    console.log('[Kitchen Page] Showing loading state - no user role yet')
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Checking permissions...</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Make sure you're logged in with kitchen access</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Bypass restaurant loading for now to show the interface
  if (restaurantsLoading && restaurants.length === 0) {
    console.log('[Kitchen Page] Showing loading state - restaurants loading')
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading restaurant data...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Show error if no restaurants available
  if (restaurants.length === 0 && !restaurantsLoading) {
    console.log('[Kitchen Page] Showing error state - no restaurants')
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center max-w-md">
            <div className="bg-red-100 dark:bg-red-900/30 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Restaurants Available</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No restaurants were found. Please contact an administrator to set up restaurants.
            </p>
            <Button onClick={() => window.location.reload()} className="mt-2">
              Refresh Page
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <ThemeProvider>
      <DashboardLayout>
        <div className="flex h-screen bg-gray-50 dark:bg-slate-900">
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kitchen Display</h1>
                  <Button
                    onClick={() => router.push(`/dashboard/${selectedRestaurant}/staff-assignment`)}
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                    size="sm"
                  >
                    <Users className="h-4 w-4" />
                    Staff
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300"
                    size="sm"
                  >
                    <div className="w-4 h-4 bg-yellow-400 rounded-full mr-2"></div>
                    Kitchen Light
                  </Button>
                </div>
                
                {/* Time Display */}
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {currentTime.toLocaleTimeString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {currentTime.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="px-6 py-4 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</div>
                  <div className="text-sm text-yellow-700 dark:text-yellow-300">Pending</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.preparing}</div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">Preparing</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.ready}</div>
                  <div className="text-sm text-green-700 dark:text-green-300">Ready</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.total}</div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">Total Orders</div>
                </div>
              </div>
            </div>

            {/* Restaurant Selector and Status */}
            <div className="px-6 py-4 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Restaurant:</span>
                  <Select value={selectedRestaurant || ''} onValueChange={setSelectedRestaurant}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Choose restaurant..." />
                    </SelectTrigger>
                    <SelectContent>
                      {restaurants.map((restaurant: any) => (
                        <SelectItem key={restaurant.id} value={restaurant.id}>
                          {restaurant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">Active</span>
                </div>
              </div>
            </div>

            {/* Kitchen Display Component */}
            <div className="flex-1 overflow-hidden">
              <div className="h-full">
                {(() => {
                  console.log('[Kitchen Page] About to render KitchenDisplay with selectedRestaurant:', selectedRestaurant)
                  return <KitchenDisplay restaurantId={selectedRestaurant} />
                })()}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ThemeProvider>
  )
}
 
