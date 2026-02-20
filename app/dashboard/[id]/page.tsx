'use client'

import { SidebarNavigation } from '@/components/pos/sidebar-navigation'
import { MenuList } from '@/components/menu-list'
import { OrdersList } from '@/components/orders-list'
import { ReservationsList } from '@/components/reservations-list'
import { InventoryList } from '@/components/inventory-list'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function RestaurantDashboard() {
  const params = useParams()
  const restaurantId = params.id as string
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="flex">
      <SidebarNavigation />
      <main id="main-content" className="flex-1 ml-64 bg-gray-50 min-h-screen transition-all duration-300">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Restaurant Dashboard</h2>
            <p className="text-gray-600 mt-1">Manage all aspects of your restaurant</p>
          </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 lg:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="menus">Menus</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="reservations">Reservations</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-900 font-semibold">Navigate using tabs above</p>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Restaurant Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Welcome to your restaurant management dashboard. Use the tabs above to navigate to different sections of your restaurant.</p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Create and manage menus and items</li>
                  <li>• Track and manage orders</li>
                  <li>• Handle reservations</li>
                  <li>• Monitor inventory levels</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="menus" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <MenuList restaurantId={restaurantId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <OrdersList restaurantId={restaurantId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reservations" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <ReservationsList restaurantId={restaurantId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <InventoryList restaurantId={restaurantId} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </main>
    </div>
  )
}
