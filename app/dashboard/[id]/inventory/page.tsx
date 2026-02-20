'use client'

import { SidebarNavigation } from '@/components/pos/sidebar-navigation'
import { InventoryList } from '@/components/inventory-list'
import { useParams } from 'next/navigation'

export default function InventoryPage() {
  const params = useParams()
  const restaurantId = params.id as string

  return (
    <div className="flex">
      <SidebarNavigation />
      <main id="main-content" className="flex-1 ml-64 bg-gray-50 min-h-screen transition-all duration-300">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
            <p className="text-gray-600 mt-1">Track and manage your restaurant inventory</p>
          </div>
          <InventoryList restaurantId={restaurantId} />
        </div>
      </main>
    </div>
  )
}
