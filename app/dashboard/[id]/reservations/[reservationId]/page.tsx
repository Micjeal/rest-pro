'use client'

import { useState, useEffect } from 'react'
import { SidebarNavigation } from '@/components/pos/sidebar-navigation'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, Trash2, Calendar, Users, Phone, Mail, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { useReservations } from '@/hooks/use-reservations'
import { useRestaurants } from '@/hooks/use-restaurants'

interface Reservation {
  id: string
  restaurant_id: string
  customer_name: string
  customer_phone: string
  customer_email: string
  party_size: number
  reservation_date: string
  status: 'confirmed' | 'completed' | 'cancelled'
  notes: string
  created_at: string
  updated_at: string
}

export default function ReservationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const restaurantId = params.id as string
  const reservationId = params.reservationId as string
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null)
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Use real data from hooks
  const { restaurants, isLoading: restaurantsLoading } = useRestaurants()
  const { reservations, isLoading: reservationsLoading } = useReservations(selectedRestaurant)
  
  // Set default restaurant when data loads
  useEffect(() => {
    if (restaurants.length > 0 && !selectedRestaurant) {
      const urlRestaurantExists = restaurants.find(r => r.id === restaurantId)
      setSelectedRestaurant(urlRestaurantExists ? restaurantId : restaurants[0].id)
    }
  }, [restaurants, selectedRestaurant, restaurantId])
  
  // Find the specific reservation when reservations load
  useEffect(() => {
    if (reservations.length > 0 && reservationId) {
      const foundReservation = reservations.find(r => r.id === reservationId)
      if (foundReservation) {
        setReservation(foundReservation)
      } else {
        toast.error('Reservation not found')
        router.push(`/dashboard/${selectedRestaurant}/reservations`)
      }
      setLoading(false)
    }
  }, [reservations, reservationId, selectedRestaurant, router])
  
  const handleUpdateStatus = async (newStatus: 'confirmed' | 'completed' | 'cancelled') => {
    if (!reservation) return
    
    try {
      const response = await fetch(`/api/reservations/${reservation.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (!response.ok) {
        throw new Error('Failed to update reservation status')
      }
      
      setReservation({ ...reservation, status: newStatus })
      toast.success(`Reservation status updated to ${newStatus}`)
    } catch (error) {
      console.error('[Reservation] Error updating status:', error)
      toast.error('Failed to update status')
    }
  }
  
  const handleDelete = async () => {
    if (!reservation) return
    
    if (!confirm('Are you sure you want to delete this reservation?')) {
      return
    }
    
    try {
      const response = await fetch(`/api/reservations/${reservation.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete reservation')
      }
      
      toast.success('Reservation deleted successfully')
      router.push(`/dashboard/${selectedRestaurant}/reservations`)
    } catch (error) {
      console.error('[Reservation] Error deleting:', error)
      toast.error('Failed to delete reservation')
    }
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  if (loading || restaurantsLoading || reservationsLoading) {
    return (
      <div className="flex">
        <SidebarNavigation />
        <main id="main-content" className="flex-1 ml-64 bg-gray-50 min-h-screen transition-all duration-300">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading reservation details...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }
  
  if (!reservation) {
    return (
      <div className="flex">
        <SidebarNavigation />
        <main id="main-content" className="flex-1 ml-64 bg-gray-50 min-h-screen transition-all duration-300">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Reservation Not Found</h2>
              <p className="text-gray-600 mb-6">The reservation you're looking for doesn't exist.</p>
              <Button onClick={() => router.push(`/dashboard/${selectedRestaurant}/reservations`)}>
                Back to Reservations
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }
  
  return (
    <div className="flex">
      <SidebarNavigation />
      <main id="main-content" className="flex-1 ml-64 bg-gray-50 min-h-screen transition-all duration-300">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.push(`/dashboard/${selectedRestaurant}/reservations`)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Reservations
            </Button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Reservation Details</h1>
                <p className="text-gray-600 mt-1">View and manage reservation information</p>
              </div>
              <Badge className={getStatusColor(reservation.status)}>
                {reservation.status}
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{reservation.customer_name}</h3>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                      {reservation.customer_phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {reservation.customer_phone}
                        </div>
                      )}
                      {reservation.customer_email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {reservation.customer_email}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Reservation Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Reservation Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Date & Time</p>
                      <p className="font-medium">{formatDate(reservation.reservation_date)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Party Size</p>
                      <p className="font-medium">{reservation.party_size} {reservation.party_size === 1 ? 'person' : 'people'}</p>
                    </div>
                  </div>
                  {reservation.notes && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Notes</p>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{reservation.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Actions Sidebar */}
            <div className="space-y-6">
              {/* Status Management */}
              <Card>
                <CardHeader>
                  <CardTitle>Status Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {reservation.status !== 'confirmed' && (
                    <Button
                      onClick={() => handleUpdateStatus('confirmed')}
                      className="w-full"
                      variant="outline"
                    >
                      Mark as Confirmed
                    </Button>
                  )}
                  {reservation.status !== 'completed' && (
                    <Button
                      onClick={() => handleUpdateStatus('completed')}
                      className="w-full"
                    >
                      Mark as Completed
                    </Button>
                  )}
                  {reservation.status !== 'cancelled' && (
                    <Button
                      onClick={() => handleUpdateStatus('cancelled')}
                      className="w-full"
                      variant="destructive"
                    >
                      Cancel Reservation
                    </Button>
                  )}
                </CardContent>
              </Card>
              
              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => router.push(`/dashboard/${selectedRestaurant}/reservations/${reservation.id}/edit`)}
                    className="w-full"
                    variant="outline"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Reservation
                  </Button>
                  <Button
                    onClick={handleDelete}
                    className="w-full"
                    variant="destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Reservation
                  </Button>
                </CardContent>
              </Card>
              
              {/* Timestamps */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Timestamps
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <p className="text-gray-600">Created</p>
                    <p className="font-medium">{formatDate(reservation.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Last Updated</p>
                    <p className="font-medium">{formatDate(reservation.updated_at)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
