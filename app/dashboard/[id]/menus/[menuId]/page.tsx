'use client'

import { DashboardHeader } from '@/components/dashboard-header'
import { MenuItemsList } from '@/components/menu-items-list'
import { useParams } from 'next/navigation'

export default function MenuDetailPage() {
  const params = useParams()
  const restaurantId = params.id as string
  const menuId = params.menuId as string

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Menu Management</h2>
          <p className="text-gray-600 mt-1">Manage menu items</p>
        </div>
        <MenuItemsList restaurantId={restaurantId} menuId={menuId} />
      </main>
    </div>
  )
}
