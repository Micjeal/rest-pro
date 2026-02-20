'use client'

import { SidebarNavigation } from '@/components/pos/sidebar-navigation'
import { OrderForm } from '@/components/order-form'
import { useParams } from 'next/navigation'

export default function NewOrderPage() {
  const params = useParams()
  const restaurantId = params.id as string

  return (
    <div className="flex">
      <SidebarNavigation />
      <main id="main-content" className="flex-1 ml-64 bg-gray-50 min-h-screen transition-all duration-300">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Create New Order</h2>
            <p className="text-gray-600 mt-1">Add a new order for your restaurant</p>
          </div>
          <OrderForm restaurantId={restaurantId} />
        </div>
      </main>
    </div>
  )
}
