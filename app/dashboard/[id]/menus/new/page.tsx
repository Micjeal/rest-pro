'use client'

import { DashboardHeader } from '@/components/dashboard-header'
import { MenuForm } from '@/components/menu-form'
import { useParams } from 'next/navigation'

export default function NewMenuPage() {
  const params = useParams()
  const restaurantId = params.id as string

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Create New Menu</h2>
          <p className="text-gray-600 mt-1">Add a new menu to your restaurant</p>
        </div>
        <MenuForm restaurantId={restaurantId} />
      </main>
    </div>
  )
}
