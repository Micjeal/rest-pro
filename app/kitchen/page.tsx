'use client'

import { useState, useEffect } from 'react'
import { SidebarNavigation } from '@/components/pos/sidebar-navigation'
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

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic'

export default function KitchenPage() {
  const [userRole, setUserRole] = useState<string>('')
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | undefined>(undefined)
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
    // Only access localStorage on client side
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('userRole')
      setUserRole(role || '')

      // Only allow kitchen staff and management roles to access kitchen
      if (![...kitchenRoles, ...managementRoles].includes(role as any)) {
        toast({
          title: 'Access Denied',
          description: 'Only kitchen staff can access the kitchen display.',
          variant: 'destructive'
        })
        router.push('/dashboard')
        return
      }
    }

    // Set default restaurant when data loads
    if (restaurants.length > 0 && selectedRestaurant === undefined) {
      setSelectedRestaurant(restaurants[0].id)
    }
  }, [router, toast, restaurants, selectedRestaurant, kitchenRoles, managementRoles])

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const getKitchenStats = () => {
    const pending = orders.filter(o => o.status === 'pending').length
    const preparing = orders.filter(o => o.status === 'preparing').length
    const ready = orders.filter(o => o.status === 'ready').length
    const total = orders.length
    return { pending, preparing, ready, total }
  }

  const stats = getKitchenStats()

  if (!userRole) {
    return (
      <div className="flex h-screen">
        <SidebarNavigation />
        <main className="flex-1 ml-64 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Checking permissions...</p>
          </div>
        </main>
      </div>
    )
  }

  if (![...kitchenRoles, ...managementRoles].includes(userRole as any)) {
    return null
  }

  return (
    <ThemeProvider>
      <div className="flex h-screen kitchen-mode">
        <SidebarNavigation />
        <main className="flex-1 lg:ml-64 bg-gradient-to-br from-slate-50 via-orange-50 to-red-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 py-4 lg:px-6 lg:py-6">
            {/* Enhanced Header with Stats - Mobile Optimized */}
            <div className="mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="flex h-12 w-12 lg:h-16 lg:w-16 items-center justify-center rounded-xl lg:rounded-2xl bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 shadow-lg lg:shadow-xl shadow-orange-500/30 animate-pulse">
                      <ChefHat className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 h-3 w-3 lg:h-4 lg:w-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-900"></div>
                  </div>
                  <div>
                    <h1 className="text-xl lg:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Kitchen Display</h1>
                    <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 font-medium">Real-time order management system</p>
                  </div>
                </div>
                
                {/* Theme Toggle and Clock - Mobile Optimized */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {/* Staff Assignment Button */}
                  {selectedRestaurant && (
                    <Button
                      onClick={() => router.push(`/dashboard/${selectedRestaurant}/staff-assignment`)}
                      className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 text-sm lg:text-base"
                      size="sm"
                    >
                      <Users className="h-4 w-4" />
                      <span className="hidden sm:inline">Staff</span>
                      <ArrowRight className="h-4 w-4 hidden lg:inline" />
                    </Button>
                  )}
                  <ThemeToggle />
                  {/* Real-time Clock */}
                  <div className="text-right">
                    <div className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white">
                      {currentTime.toLocaleTimeString()}
                    </div>
                    <div className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">
                      {currentTime.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Kitchen Stats Bar - Mobile Optimized */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
              <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
                <CardContent className="p-3 lg:p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs lg:text-sm font-medium text-yellow-600 dark:text-yellow-400">Pending</p>
                      <p className="text-xl lg:text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats.pending}</p>
                    </div>
                    <Clock className="h-6 w-6 lg:h-8 lg:w-8 text-yellow-500 dark:text-yellow-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-3 lg:p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs lg:text-sm font-medium text-blue-600 dark:text-blue-400">Preparing</p>
                      <p className="text-xl lg:text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.preparing}</p>
                    </div>
                    <ChefHat className="h-6 w-6 lg:h-8 lg:w-8 text-blue-500 dark:text-blue-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800 cursor-pointer hover:shadow-lg transition-all duration-300"
                    onClick={() => selectedRestaurant && router.push(`/dashboard/${selectedRestaurant}/staff-assignment`)}>
                <CardContent className="p-3 lg:p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs lg:text-sm font-medium text-green-600 dark:text-green-400">Ready</p>
                      <p className="text-xl lg:text-2xl font-bold text-green-700 dark:text-green-300">{stats.ready}</p>
                      {stats.ready > 0 && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1 hidden lg:block">Click to assign servers</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-6 w-6 lg:h-8 lg:w-8 text-green-500 dark:text-green-400" />
                      {stats.ready > 0 && (
                        <div className="h-2 w-2 lg:h-3 lg:w-3 bg-green-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
                <CardContent className="p-3 lg:p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs lg:text-sm font-medium text-purple-600 dark:text-purple-400">Total Orders</p>
                      <p className="text-xl lg:text-2xl font-bold text-purple-700 dark:text-purple-300">{stats.total}</p>
                    </div>
                    <Users className="h-6 w-6 lg:h-8 lg:w-8 text-purple-500 dark:text-purple-400" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Compact Restaurant Selector - Mobile Optimized */}
          <div className="mb-6 px-4 lg:px-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Restaurant:</span>
              <Select value={selectedRestaurant ?? ''} onValueChange={setSelectedRestaurant} disabled={restaurantsLoading}>
                <SelectTrigger className="w-full sm:w-64 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-gray-200 dark:border-slate-600">
                  <SelectValue placeholder="Select restaurant" />
                </SelectTrigger>
                <SelectContent>
                  {restaurants.map((restaurant: any) => (
                    <SelectItem key={restaurant.id} value={restaurant.id}>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                        {restaurant.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedRestaurant && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800">
                  Active
                </Badge>
              )}
            </div>
          </div>
          
          <KitchenDisplay restaurantId={selectedRestaurant} />
        </main>
      </div>
    </ThemeProvider>
  )
}
