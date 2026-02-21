'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { ReservationsList } from '@/components/reservations-list'
import { useReservations } from '@/hooks/use-reservations'
import { Calendar, Search, Filter, Users, Clock, CheckCircle, XCircle, AlertCircle, Plus, Edit, Trash2, Printer } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface Reservation {
  id: string
  restaurant_id: string
  customer_name: string
  customer_phone: string
  customer_email?: string
  party_size: number
  reservation_date: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show'
  notes?: string
  created_at: string
  updated_at: string
}

interface ReservationsPageProps {
  params: {
    id: string
  }
}

const statusColors: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-800 border-green-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  completed: 'bg-gray-100 text-gray-800 border-gray-200',
  'no-show': 'bg-orange-100 text-orange-800 border-orange-200',
}

const statusIcons: Record<string, React.ReactNode> = {
  confirmed: <CheckCircle className="h-4 w-4" />,
  pending: <AlertCircle className="h-4 w-4" />,
  cancelled: <XCircle className="h-4 w-4" />,
  completed: <CheckCircle className="h-4 w-4" />,
  'no-show': <XCircle className="h-4 w-4" />,
}

export default function ReservationsPage({ params }: ReservationsPageProps) {
  const restaurantId = params.id
  const { reservations, isLoading, mutate } = useReservations(restaurantId)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null)
  const [deletingReservation, setDeletingReservation] = useState<Reservation | null>(null)
  const [dateRangeFilter, setDateRangeFilter] = useState({ start: '', end: '' })
  const [partySizeFilter, setPartySizeFilter] = useState<string>('all')
  const [isLoadingAction, setIsLoadingAction] = useState(false)

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + N: Create new reservation
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        setIsCreateModalOpen(true)
      }
      // Escape: Close modals
      if (e.key === 'Escape') {
        setIsCreateModalOpen(false)
        setIsEditModalOpen(false)
        setEditingReservation(null)
        setDeletingReservation(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const filteredReservations = reservations.filter((reservation: Reservation) => {
    const matchesSearch = 
      reservation.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.customer_phone?.includes(searchTerm) ||
      reservation.customer_email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter
    
    const matchesDateRange = () => {
      if (!dateRangeFilter.start && !dateRangeFilter.end) return true
      const reservationDate = new Date(reservation.reservation_date)
      if (dateRangeFilter.start && reservationDate < new Date(dateRangeFilter.start)) return false
      if (dateRangeFilter.end && reservationDate > new Date(dateRangeFilter.end + 'T23:59:59')) return false
      return true
    }
    
    const matchesPartySize = partySizeFilter === 'all' || reservation.party_size.toString() === partySizeFilter
    
    return matchesSearch && matchesStatus && matchesDateRange() && matchesPartySize
  })

  const updateReservationStatus = async (reservationId: string, newStatus: string) => {
    setUpdatingStatus(reservationId)
    
    try {
      const response = await fetch(`/api/reservations/${reservationId}`, {
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

      toast.success(`Reservation status updated to ${newStatus}`)
      mutate() // Refresh the reservations list
    } catch (error) {
      console.error('Error updating reservation status:', error)
      toast.error('Failed to update reservation status')
    } finally {
      setUpdatingStatus(null)
    }
  }

  const createReservation = async (formData: any) => {
    setIsLoadingAction(true)
    
    try {
      const reservationData = {
        restaurant_id: restaurantId,
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        customer_email: formData.customer_email || null,
        party_size: parseInt(formData.party_size),
        reservation_date: new Date(`${formData.reservation_date}T${formData.reservation_time}`).toISOString(),
        status: formData.status || 'pending',
        notes: formData.notes || null
      }

      console.log('Sending reservation data:', reservationData)

      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(reservationData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        throw new Error(errorData.error || 'Failed to create reservation')
      }

      const result = await response.json()
      console.log('Reservation created:', result)

      toast.success('Reservation created successfully!')
      setIsCreateModalOpen(false)
      mutate() // Refresh the reservations list
    } catch (error: any) {
      console.error('Error creating reservation:', error)
      toast.error(`Failed to create reservation: ${error.message}`)
    } finally {
      setIsLoadingAction(false)
    }
  }

  const updateReservation = async (formData: any) => {
    if (!editingReservation) return
    
    setIsLoadingAction(true)
    
    try {
      const reservationData = {
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        customer_email: formData.customer_email || null,
        party_size: parseInt(formData.party_size),
        reservation_date: new Date(`${formData.reservation_date}T${formData.reservation_time}`).toISOString(),
        status: formData.status || 'pending',
        notes: formData.notes || null
      }

      console.log('Updating reservation data:', reservationData)

      const response = await fetch(`/api/reservations/${editingReservation.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(reservationData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        throw new Error(errorData.error || 'Failed to update reservation')
      }

      const result = await response.json()
      console.log('Reservation updated:', result)

      toast.success('Reservation updated successfully!')
      setIsEditModalOpen(false)
      setEditingReservation(null)
      mutate() // Refresh the reservations list
    } catch (error: any) {
      console.error('Error updating reservation:', error)
      toast.error(`Failed to update reservation: ${error.message}`)
    } finally {
      setIsLoadingAction(false)
    }
  }

  const deleteReservation = async (reservationId: string) => {
    setIsLoadingAction(true)
    
    try {
      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        throw new Error(errorData.error || 'Failed to delete reservation')
      }

      const result = await response.json()
      console.log('Reservation deleted:', result)

      toast.success('Reservation deleted successfully!')
      setDeletingReservation(null)
      mutate() // Refresh the reservations list
    } catch (error: any) {
      console.error('Error deleting reservation:', error)
      toast.error(`Failed to delete reservation: ${error.message}`)
    } finally {
      setIsLoadingAction(false)
    }
  }

  const printReservation = (reservation: Reservation) => {
    const printContent = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h2>Reservation Details</h2>
        <p><strong>Reservation ID:</strong> #${reservation.id.slice(0, 8)}</p>
        <p><strong>Customer Name:</strong> ${reservation.customer_name}</p>
        <p><strong>Phone:</strong> ${reservation.customer_phone}</p>
        ${reservation.customer_email ? `<p><strong>Email:</strong> ${reservation.customer_email}</p>` : ''}
        <p><strong>Party Size:</strong> ${reservation.party_size} guests</p>
        <p><strong>Date & Time:</strong> ${format(new Date(reservation.reservation_date), 'MMM dd, yyyy HH:mm')}</p>
        <p><strong>Status:</strong> ${reservation.status}</p>
        ${reservation.notes ? `<p><strong>Notes:</strong> ${reservation.notes}</p>` : ''}
        <p><strong>Created:</strong> ${format(new Date(reservation.created_at), 'MMM dd, yyyy HH:mm')}</p>
      </div>
    `
    
    const printWindow = window.open('', '', 'width=600,height=600')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const ReservationForm = ({ reservation, onSubmit, isLoading }: { 
    reservation?: Reservation, 
    onSubmit: (data: any) => void, 
    isLoading: boolean 
  }) => {
    const [formData, setFormData] = useState({
      customer_name: reservation?.customer_name || '',
      customer_phone: reservation?.customer_phone || '',
      customer_email: reservation?.customer_email || '',
      party_size: reservation?.party_size?.toString() || '',
      reservation_date: reservation?.reservation_date ? format(new Date(reservation.reservation_date), 'yyyy-MM-dd') : '',
      reservation_time: reservation?.reservation_date ? format(new Date(reservation.reservation_date), 'HH:mm') : '',
      status: reservation?.status || 'pending',
      notes: reservation?.notes || '',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target
      setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (value: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show') => {
      setFormData((prev) => ({ ...prev, status: value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      if (!formData.customer_name || !formData.customer_phone || !formData.party_size || !formData.reservation_date || !formData.reservation_time) {
        toast.error('Please fill in all required fields')
        return
      }
      onSubmit(formData)
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="customer_name">Customer Name *</Label>
          <Input
            id="customer_name"
            name="customer_name"
            value={formData.customer_name}
            onChange={handleChange}
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="customer_phone">Phone *</Label>
          <Input
            id="customer_phone"
            name="customer_phone"
            value={formData.customer_phone}
            onChange={handleChange}
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="customer_email">Email</Label>
          <Input
            id="customer_email"
            name="customer_email"
            type="email"
            value={formData.customer_email}
            onChange={handleChange}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="party_size">Party Size *</Label>
          <Input
            id="party_size"
            name="party_size"
            type="number"
            min="1"
            value={formData.party_size}
            onChange={handleChange}
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="reservation_date">Date *</Label>
          <Input
            id="reservation_date"
            name="reservation_date"
            type="date"
            value={formData.reservation_date}
            onChange={handleChange}
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="reservation_time">Time *</Label>
          <Input
            id="reservation_time"
            name="reservation_time"
            type="time"
            value={formData.reservation_time}
            onChange={handleChange}
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={handleSelectChange}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="no-show">No Show</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="mt-1"
            rows={3}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Saving...' : reservation ? 'Update Reservation' : 'Create Reservation'}
        </Button>
      </form>
    )
  }

  const StatusSelector = ({ reservation }: { reservation: Reservation }) => (
    <Select
      value={reservation.status}
      onValueChange={(value) => updateReservationStatus(reservation.id, value)}
      disabled={updatingStatus === reservation.id}
    >
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pending">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            Pending
          </div>
        </SelectItem>
        <SelectItem value="confirmed">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            Confirmed
          </div>
        </SelectItem>
        <SelectItem value="cancelled">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-600" />
            Cancelled
          </div>
        </SelectItem>
        <SelectItem value="completed">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-gray-600" />
            Completed
          </div>
        </SelectItem>
        <SelectItem value="no-show">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-orange-600" />
            No Show
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-48"></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-8"></div>
                  </div>
                  <div className="h-8 w-8 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters Skeleton */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 h-10 bg-gray-200 rounded"></div>
              <div className="w-full lg:w-48 h-10 bg-gray-200 rounded"></div>
              <div className="w-full lg:w-32 h-10 bg-gray-200 rounded"></div>
              <div className="w-full lg:w-36 h-10 bg-gray-200 rounded"></div>
              <div className="w-full lg:w-36 h-10 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>

        {/* Reservations List Skeleton */}
        <Card>
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-48"></div>
          </CardHeader>
          <CardContent>
            {[1, 2, 3].map((i) => (
              <Card key={i} className="mb-4">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-48"></div>
                      </div>
                      <div className="flex gap-2">
                        <div className="h-8 bg-gray-200 rounded w-24"></div>
                        <div className="h-8 bg-gray-200 rounded w-16"></div>
                        <div className="h-8 bg-gray-200 rounded w-16"></div>
                        <div className="h-8 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="h-12 bg-gray-200 rounded"></div>
                      <div className="h-12 bg-gray-200 rounded"></div>
                      <div className="h-12 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reservations</h1>
          <p className="text-gray-600 mt-1">Manage restaurant reservations and booking status</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Reservation
              <span className="hidden md:inline text-xs opacity-70">Ctrl+N</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Reservation</DialogTitle>
            </DialogHeader>
            <ReservationForm 
              onSubmit={createReservation} 
              isLoading={isLoadingAction}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total</p>
                <p className="text-2xl font-bold text-blue-900">{reservations.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {reservations.filter((r: Reservation) => r.status === 'pending').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Confirmed</p>
                <p className="text-2xl font-bold text-green-900">
                  {reservations.filter((r: Reservation) => r.status === 'confirmed').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">Cancelled</p>
                <p className="text-2xl font-bold text-red-900">
                  {reservations.filter((r: Reservation) => r.status === 'cancelled').length}
                </p>
              </div>    
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, phone, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full lg:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="no-show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full lg:w-32">
              <Select value={partySizeFilter} onValueChange={setPartySizeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Party Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sizes</SelectItem>
                  <SelectItem value="1">1 Guest</SelectItem>
                  <SelectItem value="2">2 Guests</SelectItem>
                  <SelectItem value="3">3 Guests</SelectItem>
                  <SelectItem value="4">4 Guests</SelectItem>
                  <SelectItem value="5">5 Guests</SelectItem>
                  <SelectItem value="6">6+ Guests</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full lg:w-36">
              <Input
                type="date"
                placeholder="Start Date"
                value={dateRangeFilter.start}
                onChange={(e) => setDateRangeFilter(prev => ({ ...prev, start: e.target.value }))}
              />
            </div>
            <div className="w-full lg:w-36">
              <Input
                type="date"
                placeholder="End Date"
                value={dateRangeFilter.end}
                onChange={(e) => setDateRangeFilter(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reservations List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Reservations ({filteredReservations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredReservations.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No reservations found</p>
              <p className="text-sm text-gray-400 mt-2">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'New reservations will appear here'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReservations.map((reservation: Reservation) => (
                <Card key={reservation.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg text-gray-900">
                            {reservation.customer_name}
                          </h3>
                          <Badge className={statusColors[reservation.status] || 'bg-gray-100 text-gray-800'}>
                            <div className="flex items-center gap-1">
                              {statusIcons[reservation.status]}
                              {reservation.status}
                            </div>
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Reservation #{reservation.id.slice(0, 8)}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                        <StatusSelector reservation={reservation} />
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingReservation(reservation)
                              setIsEditModalOpen(true)
                            }}
                            className="flex items-center gap-1 text-xs h-8"
                          >
                            <Edit className="h-3 w-3" />
                            <span className="hidden sm:inline">Edit</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => printReservation(reservation)}
                            className="flex items-center gap-1 text-xs h-8"
                          >
                            <Printer className="h-3 w-3" />
                            <span className="hidden sm:inline">Print</span>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDeletingReservation(reservation)}
                                className="flex items-center gap-1 text-red-600 hover:text-red-700 text-xs h-8"
                              >
                                <Trash2 className="h-3 w-3" />
                                <span className="hidden sm:inline">Delete</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the reservation for {reservation.customer_name}. 
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteReservation(reservation.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          {updatingStatus === reservation.id && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 self-center"></div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-600">Date & Time</p>
                          <p className="font-medium text-gray-900">
                            {format(new Date(reservation.reservation_date), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-600">Party Size</p>
                          <p className="font-medium text-gray-900">{reservation.party_size} guests</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Contact</p>
                        <p className="font-medium text-gray-900">{reservation.customer_phone}</p>
                        {reservation.customer_email && (
                          <p className="text-sm text-gray-600">{reservation.customer_email}</p>
                        )}
                      </div>
                    </div>

                    {reservation.notes && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Notes</p>
                        <p className="text-sm text-gray-900">{reservation.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Reservation Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Reservation</DialogTitle>
          </DialogHeader>
          {editingReservation && (
            <ReservationForm 
              reservation={editingReservation}
              onSubmit={updateReservation} 
              isLoading={isLoadingAction}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
