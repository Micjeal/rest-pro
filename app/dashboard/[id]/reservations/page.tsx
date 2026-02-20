'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { ReservationsList } from '@/components/reservations-list'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRestaurants } from '@/hooks/use-restaurants'

export default function ReservationsPage() {
  const params = useParams()
  const urlRestaurantId = params.id as string
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null)
  
  // Use real data from hooks
  const { restaurants, isLoading: restaurantsLoading } = useRestaurants()
  
  // Set default restaurant when data loads, or use URL restaurant ID
  useEffect(() => {
    if (restaurants.length > 0 && !selectedRestaurant) {
      // If URL has a valid restaurant ID that exists in our restaurants, use it
      const urlRestaurantExists = restaurants.find((r: any) => r.id === urlRestaurantId)
      setSelectedRestaurant(urlRestaurantExists ? urlRestaurantId : restaurants[0].id)
    }
  }, [restaurants, selectedRestaurant, urlRestaurantId])

  const restaurantId = selectedRestaurant || urlRestaurantId

  return (
    <DashboardLayout 
      title="Reservations"
      subtitle="Manage your restaurant reservations"
    >
      {/* Restaurant Selector */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Restaurant</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedRestaurant || ''} onValueChange={setSelectedRestaurant} disabled={restaurantsLoading}>
            <SelectTrigger>
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
        </CardContent>
      </Card>

      {restaurantId && <ReservationsList restaurantId={restaurantId} />}
    </DashboardLayout>
  )
}
