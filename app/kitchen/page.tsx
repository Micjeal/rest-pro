'use client'

import { useEffect, useMemo, useState } from 'react'
import { SidebarNavigation } from '@/components/pos/sidebar-navigation'
import { useKitchenOrders } from '@/hooks/use-kitchen-orders'
import { KitchenDisplay } from '@/components/kitchen/kitchen-display'
import { useToast } from '@/hooks/use-toast'
import { ChefHat, Users, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRestaurants } from '@/hooks/use-restaurants'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getRolesByCategory } from '@/components/users/role-definitions'

export const dynamic = 'force-dynamic'

function KitchenClock() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 30000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="text-right">
      <div className="text-xl font-semibold text-slate-900 dark:text-white">
        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
      <div className="text-xs text-slate-500 dark:text-slate-400">
        {currentTime.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </div>
    </div>
  )
}

export default function KitchenPage() {
  const [userRole, setUserRole] = useState<string>('')
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | undefined>(undefined)
  const router = useRouter()
  const { toast } = useToast()

  const kitchenRoles = useMemo(() => getRolesByCategory('Kitchen').map((r) => r.value), [])
  const managementRoles = useMemo(() => getRolesByCategory('Management').map((r) => r.value), [])
  const allowedRoles = useMemo(() => [...kitchenRoles, ...managementRoles], [kitchenRoles, managementRoles])

  const { restaurants, isLoading: restaurantsLoading } = useRestaurants()
  const {
    orders,
    isLoading: ordersLoading,
    updateOrderStatus,
  } = useKitchenOrders(selectedRestaurant)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const role = localStorage.getItem('userRole') || ''
    setUserRole(role)

    if (role && !allowedRoles.includes(role as any)) {
      toast({
        title: 'Access Denied',
        description: 'Only kitchen staff can access the kitchen display.',
        variant: 'destructive',
      })
      router.push('/dashboard')
    }
  }, [allowedRoles, router, toast])

  useEffect(() => {
    if (restaurants.length > 0 && !selectedRestaurant) {
      setSelectedRestaurant(restaurants[0].id)
    }
  }, [restaurants, selectedRestaurant])

  const stats = useMemo(() => {
    const pending = orders.filter((o) => o.status === 'pending').length
    const preparing = orders.filter((o) => o.status === 'preparing').length
    const ready = orders.filter((o) => o.status === 'ready').length
    const total = orders.length

    return { pending, preparing, ready, total }
  }, [orders])

  if (!userRole) {
    return (
      <div className="flex min-h-screen">
        <SidebarNavigation />
        <main className="flex flex-1 items-center justify-center bg-slate-50 lg:ml-64 dark:bg-slate-950">
          <div className="text-center">
            <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700 dark:border-slate-700 dark:border-t-slate-200" />
            <p className="text-sm text-slate-600 dark:text-slate-400">Checking permissions...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!allowedRoles.includes(userRole as any)) {
    return null
  }

  return (
    <div className="flex min-h-screen">
      <SidebarNavigation />
      <main className="flex-1 overflow-y-auto bg-slate-50 lg:ml-64 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-4 lg:px-6 lg:py-6">
          <section className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                  <ChefHat className="h-6 w-6 text-slate-700 dark:text-slate-200" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-slate-900 dark:text-white lg:text-2xl">
                    Kitchen Display
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Track and update live order flow
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-start lg:self-auto">
                {selectedRestaurant && (
                  <Button
                    onClick={() => router.push(`/dashboard/${selectedRestaurant}/staff-assignment`)}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Users className="h-4 w-4" />
                    Staff
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
                <KitchenClock />
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Restaurant</span>
              <Select
                value={selectedRestaurant ?? ''}
                onValueChange={setSelectedRestaurant}
                disabled={restaurantsLoading}
              >
                <SelectTrigger className="w-full sm:w-72">
                  <SelectValue placeholder="Select restaurant" />
                </SelectTrigger>
                <SelectContent>
                  {restaurants.map((restaurant: any) => (
                    <SelectItem key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedRestaurant && (
                <Badge variant="outline" className="w-fit">
                  Active
                </Badge>
              )}
            </div>
          </section>

          <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Card className="border-slate-200 shadow-sm dark:border-slate-800">
              <CardContent className="p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-amber-700 dark:text-amber-300">
                  Pending
                </p>
                <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">{stats.pending}</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm dark:border-slate-800">
              <CardContent className="p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-blue-700 dark:text-blue-300">
                  Preparing
                </p>
                <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">{stats.preparing}</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm dark:border-slate-800">
              <CardContent className="p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                  Ready
                </p>
                <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">{stats.ready}</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm dark:border-slate-800">
              <CardContent className="p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-300">
                  Total
                </p>
                <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">{stats.total}</p>
              </CardContent>
            </Card>
          </div>

          <KitchenDisplay
            restaurantId={selectedRestaurant}
            orders={orders}
            isLoading={ordersLoading}
            updateOrderStatus={updateOrderStatus}
          />
        </div>
      </main>
    </div>
  )
}
