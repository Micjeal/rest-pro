'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import Link from 'next/link'
import { MapPin, Phone, Mail, Trash2, AlertTriangle, Store, Menu, ShoppingCart, Calendar, Package } from 'lucide-react'
import { toast } from 'sonner'

interface RestaurantCardProps {
  id: string
  name: string
  address?: string
  phone?: string
  email?: string
  created_at?: string
  onDelete?: () => void
}

interface DeletionSummary {
  restaurant_name: string
  menus_count: number
  menu_items_count: number
  orders_count: number
  order_items_count: number
  reservations_count: number
  inventory_items_count: number
}

export function RestaurantCard({
  id,
  name,
  address,
  phone,
  email,
  created_at,
  onDelete,
}: RestaurantCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletionSummary, setDeletionSummary] = useState<DeletionSummary | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoadingSummary, setIsLoadingSummary] = useState(false)

  const getAuthToken = () => {
    return localStorage.getItem('auth_token')
  }

  const fetchDeletionSummary = async () => {
    setIsLoadingSummary(true)
    try {
      const token = getAuthToken()
      console.log('[RestaurantCard] Restaurant ID prop:', id)
      console.log('[RestaurantCard] Restaurant ID type:', typeof id)
      
      if (!id || id === 'undefined') {
        console.error('[RestaurantCard] Invalid restaurant ID:', id)
        throw new Error('Invalid restaurant ID')
      }
      
      const response = await fetch(`/api/restaurants/${id}/delete-summary`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[RestaurantCard] API Response Status:', response.status)
        console.error('[RestaurantCard] API Response Text:', errorText)
        throw new Error(`Failed to fetch deletion summary: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      setDeletionSummary(data)
    } catch (error) {
      console.error('Error fetching deletion summary:', error)
      toast.error('Failed to load deletion summary')
    } finally {
      setIsLoadingSummary(false)
    }
  }

  const handleDeleteRestaurant = async () => {
    setIsDeleting(true)
    try {
      const token = getAuthToken()
      // Use the delete-summary endpoint which has working cascading delete
      const response = await fetch(`/api/restaurants/${id}/delete-summary`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete restaurant')
      }

      const data = await response.json()
      
      toast.success(`Restaurant "${name}" and all associated data deleted successfully`, {
        description: `Deleted ${data.deleted.menus} menus, ${data.deleted.orders} orders, ${data.deleted.reservations} reservations`
      })

      setDeleteDialogOpen(false)
      onDelete?.()
    } catch (error) {
      console.error('Error deleting restaurant:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete restaurant')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteDialogOpen = (open: boolean) => {
    if (open) {
      fetchDeletionSummary()
    }
    setDeleteDialogOpen(open)
  }

  const getTotalItemsCount = () => {
    if (!deletionSummary) return 0
    return deletionSummary.menus_count + 
           deletionSummary.menu_items_count + 
           deletionSummary.orders_count + 
           deletionSummary.order_items_count + 
           deletionSummary.reservations_count + 
           deletionSummary.inventory_items_count
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-blue-600" />
            <div>
              <CardTitle className="text-lg">{name}</CardTitle>
              {created_at && (
                <p className="text-sm text-gray-500">
                  Created: {new Date(created_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {address && (
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{address}</span>
          </div>
        )}
        {phone && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="h-4 w-4 flex-shrink-0" />
            <span>{phone}</span>
          </div>
        )}
        {email && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="h-4 w-4 flex-shrink-0" />
            <span>{email}</span>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Link href={`/dashboard/${id}`} className="flex-1">
            <Button className="w-full" size="sm">
              Manage
            </Button>
          </Link>
          
          <Dialog open={deleteDialogOpen} onOpenChange={handleDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Delete Restaurant
                </DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete the restaurant 
                  and all associated data.
                </DialogDescription>
              </DialogHeader>

              {isLoadingSummary ? (
                <div className="flex items-center justify-center py-4">
                  <div className="text-sm text-gray-500">Loading deletion summary...</div>
                </div>
              ) : deletionSummary ? (
                <div className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      You are about to delete <strong>{deletionSummary.restaurant_name}</strong> 
                      and <strong>{getTotalItemsCount()}</strong> related items.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2 text-sm">
                    <h4 className="font-medium">Items to be deleted:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {deletionSummary.menus_count > 0 && (
                        <div className="flex items-center gap-2">
                          <Menu className="h-4 w-4 text-blue-600" />
                          <span>{deletionSummary.menus_count} Menus</span>
                        </div>
                      )}
                      {deletionSummary.menu_items_count > 0 && (
                        <div className="flex items-center gap-2">
                          <Store className="h-4 w-4 text-green-600" />
                          <span>{deletionSummary.menu_items_count} Menu Items</span>
                        </div>
                      )}
                      {deletionSummary.orders_count > 0 && (
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="h-4 w-4 text-orange-600" />
                          <span>{deletionSummary.orders_count} Orders</span>
                        </div>
                      )}
                      {deletionSummary.order_items_count > 0 && (
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-purple-600" />
                          <span>{deletionSummary.order_items_count} Order Items</span>
                        </div>
                      )}
                      {deletionSummary.reservations_count > 0 && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-red-600" />
                          <span>{deletionSummary.reservations_count} Reservations</span>
                        </div>
                      )}
                      {deletionSummary.inventory_items_count > 0 && (
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-600" />
                          <span>{deletionSummary.inventory_items_count} Inventory Items</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setDeleteDialogOpen(false)}
                      className="flex-1"
                      disabled={isDeleting}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleDeleteRestaurant}
                      className="flex-1"
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Deleting...' : 'Delete Everything'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">Failed to load deletion summary</p>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}
