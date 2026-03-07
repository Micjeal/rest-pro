'use client'

import { useMemo, useState } from 'react'
import { OrderCard } from './order-card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Clock, ChefHat, CheckCircle } from 'lucide-react'
import type { KitchenOrder } from '@/hooks/use-kitchen-orders'

type FilterTab = 'all' | 'pending' | 'preparing' | 'ready'

interface KitchenDisplayProps {
  restaurantId?: string
  orders: KitchenOrder[]
  isLoading: boolean
  updateOrderStatus: (orderId: string, status: string) => Promise<boolean>
}

export function KitchenDisplay({
  restaurantId,
  orders,
  isLoading,
  updateOrderStatus,
}: KitchenDisplayProps) {
  const [filterTab, setFilterTab] = useState<FilterTab>('all')

  const statusCounts = useMemo(() => {
    const pending = orders.filter((order) => order.status === 'pending').length
    const preparing = orders.filter((order) => order.status === 'preparing').length
    const ready = orders.filter((order) => order.status === 'ready').length

    return {
      all: orders.length,
      pending,
      preparing,
      ready,
    }
  }, [orders])

  const filteredOrders = useMemo(() => {
    if (filterTab === 'all') return orders
    return orders.filter((order) => order.status === filterTab)
  }, [orders, filterTab])

  const handleStatusUpdate = async (
    orderId: string,
    currentStatus: string,
    targetStatus?: string
  ) => {
    const nextStatus =
      targetStatus ||
      (currentStatus === 'pending'
        ? 'preparing'
        : currentStatus === 'preparing'
          ? 'ready'
          : 'completed')

    const success = await updateOrderStatus(orderId, nextStatus)
    if (!success) {
      console.error('Failed to update order status')
    }
  }

  if (!restaurantId) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <ChefHat className="h-7 w-7 text-slate-600 dark:text-slate-300" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No Restaurant Selected</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Select a restaurant to load kitchen orders.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600 dark:border-slate-700 dark:border-t-slate-200" />
        <p className="text-sm text-slate-600 dark:text-slate-400">Loading kitchen orders...</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4">
        <Tabs value={filterTab} onValueChange={(value) => setFilterTab(value as FilterTab)}>
          <TabsList className="grid grid-cols-4 rounded-lg border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <TabsTrigger value="all" className="flex items-center gap-2 rounded-md">
              <Clock className="h-4 w-4" />
              <span>All</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs dark:bg-slate-800">
                {statusCounts.all}
              </span>
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2 rounded-md">
              <Clock className="h-4 w-4" />
              <span>Pending</span>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                {statusCounts.pending}
              </span>
            </TabsTrigger>
            <TabsTrigger value="preparing" className="flex items-center gap-2 rounded-md">
              <ChefHat className="h-4 w-4" />
              <span>Preparing</span>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                {statusCounts.preparing}
              </span>
            </TabsTrigger>
            <TabsTrigger value="ready" className="flex items-center gap-2 rounded-md">
              <CheckCircle className="h-4 w-4" />
              <span>Ready</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                {statusCounts.ready}
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-y-auto pb-4">
        {filteredOrders.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
            <Clock className="mx-auto mb-3 h-8 w-8 text-slate-400 dark:text-slate-500" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {filterTab === 'all'
                ? 'No Active Orders'
                : `No ${filterTab.charAt(0).toUpperCase() + filterTab.slice(1)} Orders`}
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {filterTab === 'all'
                ? 'Kitchen is clear for now.'
                : `There are currently no orders in ${filterTab} status.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
