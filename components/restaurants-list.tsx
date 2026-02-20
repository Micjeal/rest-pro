'use client'

import { useRestaurants } from '@/hooks/use-restaurants'
import { RestaurantCard } from './restaurant-card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useEffect } from 'react'
import { Plus } from 'lucide-react'

/**
 * RestaurantsList Component
 * Displays a grid of all user restaurants
 * Handles loading and empty states
 * Enhanced with modern design
 */
export function RestaurantsList() {
  const { restaurants, isLoading, mutate } = useRestaurants()

  const handleDelete = async () => {
    // Trigger a re-fetch of the restaurants list
    await mutate()
  }

  useEffect(() => {
    if (!isLoading) {
      console.log(`[RestaurantsList] Loaded ${restaurants?.length || 0} restaurants`)
    }
  }, [restaurants, isLoading])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 bg-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading restaurants...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Restaurants</h2>
        <Link href="/dashboard/new-restaurant">
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200">
            <Plus className="h-4 w-4 mr-2" />
            Add Restaurant
          </Button>
        </Link>
      </div>

      {restaurants.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-700 px-6 py-16 text-center bg-white dark:bg-slate-800/50">
          <div className="flex flex-col items-center">
            <div className="h-16 w-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">No restaurants yet. Create your first one!</p>
            <Link href="/dashboard/new-restaurant">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                Create Restaurant
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant: any) => (
            <RestaurantCard
              key={restaurant.id}
              id={restaurant.id}
              name={restaurant.name}
              address={restaurant.address}
              phone={restaurant.phone}
              email={restaurant.email}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
