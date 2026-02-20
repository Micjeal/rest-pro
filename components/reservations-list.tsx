'use client'

import { useReservations } from '@/hooks/use-reservations'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Calendar, Users } from 'lucide-react'
import { format } from 'date-fns'

interface ReservationsListProps {
  restaurantId: string
}

const statusColors: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-gray-100 text-gray-800',
}

export function ReservationsList({ restaurantId }: ReservationsListProps) {
  const { reservations, isLoading } = useReservations(restaurantId)

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading reservations...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Reservations</h3>
        <Link href={`/dashboard/${restaurantId}/reservations/new`}>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            New Reservation
          </Button>
        </Link>
      </div>

      {reservations.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 px-4 py-8 text-center">
          <p className="text-sm text-gray-600">No reservations yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reservations.map((reservation: any) => (
            <Card key={reservation.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{reservation.customer_name}</h4>
                    <p className="text-sm text-gray-600 mt-0.5">
                      Reservation #{reservation.id.slice(0, 8)}
                    </p>
                  </div>
                  <Badge className={statusColors[reservation.status] || 'bg-gray-100 text-gray-800'}>
                    {reservation.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-gray-600 text-xs">Date & Time</p>
                      <p className="font-medium text-gray-900">
                        {format(new Date(reservation.reservation_date), 'MMM dd, HH:mm')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-gray-600 text-xs">Party Size</p>
                      <p className="font-medium text-gray-900">{reservation.party_size} guests</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Phone</p>
                    <p className="font-medium text-gray-900 text-sm">{reservation.customer_phone}</p>
                  </div>
                </div>

                {reservation.notes && (
                  <div className="mb-3 p-2 bg-gray-50 rounded">
                    <p className="text-xs text-gray-600">Notes</p>
                    <p className="text-sm text-gray-900">{reservation.notes}</p>
                  </div>
                )}

                <Link href={`/dashboard/${restaurantId}/reservations/${reservation.id}`}>
                  <Button size="sm" variant="outline" className="w-full">
                    View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
