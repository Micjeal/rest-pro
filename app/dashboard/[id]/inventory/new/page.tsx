'use client'

import { DashboardHeader } from '@/components/dashboard-header'
import { InventoryForm } from '@/components/inventory-form'
import { useParams } from 'next/navigation'

export default function NewInventoryItemPage() {
  const params = useParams()
  const restaurantId = params.id as string

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Add Inventory Item</h2>
          <p className="text-gray-600 mt-1">Add a new item to your inventory</p>
        </div>
        <InventoryForm restaurantId={restaurantId} />
      </main>
    </div>
  )
}
