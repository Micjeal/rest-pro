'use client'

import { useState, useEffect } from 'react'
import { SidebarNavigation } from '@/components/pos/sidebar-navigation'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, Users, User, ChefHat, Clock, TrendingUp, AlertCircle, CheckCircle, Bell, Volume2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRestaurants } from '@/hooks/use-restaurants'
import { useKitchenOrders } from '@/hooks/use-kitchen-orders'
import { useStaff } from '@/hooks/use-staff'
import { 
  getRolesByCategory,
  getRoleBadgeColor,
  getRoleLabel,
  type RestaurantRole 
} from '@/components/users/role-definitions'

interface KitchenStaff {
  id: string
  name: string
  role: RestaurantRole
  avatar?: string
  isAvailable: boolean
  currentOrders: number
  maxOrders: number
  specialties: string[]
  efficiency: number
}

interface ServerStaff {
  id: string
  name: string
  role: RestaurantRole
  avatar?: string
  isAvailable: boolean
  currentOrders: number
  maxOrders: number
  efficiency: number
}

export default function StaffAssignmentPage() {
  const params = useParams()
  const router = useRouter()
  const restaurantId = params.id as string
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedStaff, setSelectedStaff] = useState<string>('')
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [selectedServer, setSelectedServer] = useState<string>('')
  const [selectedReadyOrders, setSelectedReadyOrders] = useState<string[]>([])
  
  // Use real data from hooks
  const { restaurants, isLoading: restaurantsLoading } = useRestaurants()
  const { orders } = useKitchenOrders(selectedRestaurant || undefined)
  const { staff } = useStaff()
  
  // Set default restaurant when data loads
  useEffect(() => {
    if (restaurants.length > 0 && !selectedRestaurant) {
      const urlRestaurantExists = restaurants.find((r: any) => r.id === restaurantId)
      setSelectedRestaurant(urlRestaurantExists ? restaurantId : restaurants[0].id)
    }
  }, [restaurants, selectedRestaurant, restaurantId])
  
  // Stop loading when data is ready
  useEffect(() => {
    if (!restaurantsLoading) {
      setLoading(false)
    }
  }, [restaurantsLoading])

  // Filter kitchen staff (chef, manager, admin)
  const kitchenStaff: KitchenStaff[] = staff
    .filter(user => {
      const kitchenRoles = getRolesByCategory('Kitchen').map(r => r.value)
      const managementRoles = getRolesByCategory('Management').map(r => r.value)
      return [...kitchenRoles, ...managementRoles].includes(user.role as RestaurantRole)
    })
    .map(user => ({
      id: user.id,
      name: user.name,
      role: user.role as RestaurantRole,
      isAvailable: true,
      currentOrders: orders.filter(order => order.assigned_to === user.id).length,
      maxOrders: user.role === 'head_chef' ? 5 : user.role === 'sous_chef' ? 4 : user.role === 'line_cook' ? 3 : 2,
      specialties: getSpecialtiesForRole(user.role as RestaurantRole),
      efficiency: 85 + Math.floor(Math.random() * 15)
    }))

  // Filter server staff (Front of House + Support + Kitchen Staff for serving)
  const serverStaff: ServerStaff[] = staff
    .filter(user => {
      const frontOfHouseRoles = getRolesByCategory('Front of House').map(r => r.value)
      const supportRoles = getRolesByCategory('Support').map(r => r.value)
      const kitchenRoles = getRolesByCategory('Kitchen').map(r => r.value)
      // Include all front of house, support, AND kitchen staff for serving ready orders
      return [...frontOfHouseRoles, ...supportRoles, ...kitchenRoles].includes(user.role as RestaurantRole)
    })
    .map(user => ({
      id: user.id,
      name: user.name,
      role: user.role as RestaurantRole,
      isAvailable: true,
      currentOrders: orders.filter(order => order.assigned_to === user.id).length,
      maxOrders: user.role === 'server' || user.role === 'waiter' || user.role === 'waitress' ? 12 : 
                user.role === 'bartender' || user.role === 'barista' ? 8 : 6,
      efficiency: 85 + Math.floor(Math.random() * 15)
    }))

  // Ready orders for server assignment
  const readyOrders = orders.filter(order => order.status === 'ready')

  function getSpecialtiesForRole(role: RestaurantRole): string[] {
  switch (role) {
    // Management Roles
    case 'admin':
    case 'owner':
    case 'general_manager':
    case 'assistant_manager':
    case 'manager':
    case 'shift_manager':
      return ['Leadership', 'Planning', 'Quality Control']
    
    // Kitchen Staff
    case 'head_chef':
      return ['Main Courses', 'Grill', 'Sauces', 'Quality Control', 'Menu Development']
    case 'sous_chef':
      return ['Kitchen Management', 'Food Preparation', 'Staff Training']
    case 'line_cook':
      return ['Hot Line Station', 'A la Carte', 'Food Preparation']
    case 'prep_cook':
      return ['Food Prep', 'Ingredient Preparation', 'Kitchen Organization']
    case 'grill_cook':
      return ['Grill Station', 'BBQ', 'Meat Preparation']
    case 'fry_cook':
      return ['Fry Station', 'Deep Frying', 'Kitchen Equipment']
    case 'pastry_chef':
      return ['Baking', 'Desserts', 'Pastry Arts']
    case 'dishwasher':
      return ['Kitchen Cleanup', 'Sanitation', 'Dishwashing']
    case 'kitchen_helper':
      return ['Food Prep', 'Kitchen Assistance', 'Cleaning']
    
    // Front of House Staff
    case 'server':
    case 'waiter':
    case 'waitress':
      return ['Customer Service', 'Order Taking', 'Table Management']
    case 'host':
      return ['Guest Relations', 'Seating', 'Reservations']
    case 'bartender':
      return ['Mixology', 'Bar Management', 'Beverage Service']
    case 'barista':
      return ['Coffee Preparation', 'Espresso Machine', 'Customer Service']
    case 'sommelier':
      return ['Wine Selection', 'Wine Service', 'Beverage Pairing']
    case 'busser':
      return ['Table Clearing', 'Restaurant Cleanup', 'Server Support']
    case 'runner':
      return ['Food Delivery', 'Kitchen Coordination', 'Order Delivery']
    
    // Support Staff
    case 'cashier':
      return ['Payment Processing', 'Cash Handling', 'Customer Service']
    case 'delivery_driver':
      return ['Food Delivery', 'Navigation', 'Customer Interaction']
    case 'cleaner':
      return ['Sanitation', 'Facility Maintenance', 'Cleaning']
    case 'security':
      return ['Safety', 'Security Monitoring', 'Access Control']
      
    default:
      return ['General Duties', 'Restaurant Operations']
  }
}

  const unassignedOrders = orders.filter(order => 
    !order.assigned_to && (order.status === 'pending' || order.status === 'preparing')
  )

  const selectedStaffData = kitchenStaff.find(s => s.id === selectedStaff)
  const selectedServerData = serverStaff.find(s => s.id === selectedServer)

  const handleAssignOrders = async () => {
    if (!selectedStaff || selectedOrders.length === 0) return

    try {
      for (const orderId of selectedOrders) {
        const response = await fetch(`/api/orders/${orderId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify({ 
            assigned_to: selectedStaff,
            status: 'preparing'
          })
        })
        
        if (!response.ok) {
          throw new Error('Failed to assign order')
        }
      }
      
      toast.success(`Assigned ${selectedOrders.length} order${selectedOrders.length !== 1 ? 's' : ''} to staff member`)
      setSelectedOrders([])
      setSelectedStaff('')
    } catch (error) {
      console.error('Error assigning orders:', error)
      toast.error('Failed to assign orders')
    }
  }

  const handleAssignServer = async () => {
    if (!selectedServer || selectedReadyOrders.length === 0) return

    try {
      for (const orderId of selectedReadyOrders) {
        const response = await fetch(`/api/orders/${orderId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify({ 
            assigned_to: selectedServer,
            status: 'serving'
          })
        })
        
        if (!response.ok) {
          throw new Error('Failed to assign order to server')
        }
      }
      
      toast.success(`Assigned ${selectedReadyOrders.length} order${selectedReadyOrders.length !== 1 ? 's' : ''} to server`)
      setSelectedReadyOrders([])
      setSelectedServer('')
    } catch (error) {
      console.error('Error assigning orders to server:', error)
      toast.error('Failed to assign orders to server')
    }
  }

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1.0
      utterance.volume = 1.0
      speechSynthesis.speak(utterance)
    }
  }

  const callServer = (serverName: string, customerName: string, orderId: string) => {
    const message = `Attention ${serverName}, order ${orderId.substring(0, 6)} for ${customerName} is ready for pickup`
    speakText(message)
  }

  const handleCallServer = (orderId: string, serverId: string) => {
    const order = readyOrders.find(o => o.id === orderId)
    const server = serverStaff.find(s => s.id === serverId)
    if (order && server) {
      callServer(server.name, order.customer_name, order.id)
    }
  }

  const handleOrderSelection = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders([...selectedOrders, orderId])
    } else {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId))
    }
  }

  const handleReadyOrderSelection = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedReadyOrders([...selectedReadyOrders, orderId])
    } else {
      setSelectedReadyOrders(selectedReadyOrders.filter(id => id !== orderId))
    }
  }

  const handleUnassignOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ 
          assigned_to: null,
          status: 'pending'
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to unassign order')
      }
      
      toast.success('Order unassigned successfully')
    } catch (error) {
      console.error('Error unassigning order:', error)
      toast.error('Failed to unassign order')
    }
  }

  if (loading || restaurantsLoading) {
    return (
      <div className="flex">
        <SidebarNavigation />
        <main className="flex-1 ml-64 bg-gray-50 min-h-screen transition-all duration-300">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading staff assignment...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex">
      <SidebarNavigation />
      <main className="flex-1 ml-64 bg-gray-50 min-h-screen transition-all duration-300">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.push(`/dashboard/${selectedRestaurant}/orders`)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Staff Assignment</h1>
                <p className="text-gray-600 mt-1">Manage kitchen staff and order assignments</p>
              </div>
              <div className="flex items-center gap-3">
                <Select value={selectedRestaurant || ''} onValueChange={setSelectedRestaurant}>
                  <SelectTrigger className="w-64">
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
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Kitchen Staff */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Kitchen Staff
                  <Badge variant="outline" className="ml-2">
                    {kitchenStaff.filter(s => s.isAvailable).length} available
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {kitchenStaff.map(member => (
                    <Card 
                      key={member.id} 
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        !member.isAvailable ? 'opacity-50' : ''
                      } ${selectedStaff === member.id ? 'ring-2 ring-blue-500' : ''}`}
                      onClick={() => member.isAvailable && setSelectedStaff(member.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-purple-100 text-purple-700">
                              <ChefHat className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium truncate">{member.name}</p>
                              {!member.isAvailable && (
                                <Badge variant="destructive" className="text-xs">Busy</Badge>
                              )}
                            </div>
                            <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700">
                              {member.role}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Workload</span>
                            <span className="font-medium text-green-600">
                              {member.currentOrders}/{member.maxOrders}
                            </span>
                          </div>
                          <Progress 
                            value={(member.currentOrders / member.maxOrders) * 100} 
                            className="h-2"
                          />
                          
                          <div className="flex justify-between text-sm">
                            <span>Efficiency</span>
                            <span className="font-medium text-green-600">{member.efficiency}%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Order Assignment */}
            {selectedStaff && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Assign Orders to {selectedStaffData?.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {unassignedOrders.length > 0 ? (
                    <div>
                      <div className="space-y-2">
                        <div className="text-sm font-medium mb-2">Select orders to assign:</div>
                        {unassignedOrders.map(order => (
                          <div key={order.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                            <Checkbox
                              checked={selectedOrders.includes(order.id)}
                              onCheckedChange={(checked) => handleOrderSelection(order.id, checked as boolean)}
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">#{order.id?.substring(0, 6)}</span>
                                <Badge variant="outline" className="text-xs">
                                  {order.items?.length || 0} items
                                </Badge>
                                <Badge variant={order.status === 'pending' ? 'secondary' : 'default'}>
                                  {order.status}
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-500">
                                {order.customer_name}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex items-center gap-3 pt-4 border-t">
                        <Button
                          onClick={handleAssignOrders}
                          disabled={selectedOrders.length === 0}
                          className="touch-target"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Assign {selectedOrders.length} Order{selectedOrders.length !== 1 ? 's' : ''}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setSelectedOrders([])}
                        >
                          Clear Selection
                        </Button>
                        <div className="ml-auto text-sm text-gray-500">
                          Staff capacity: {selectedStaffData?.currentOrders}/{selectedStaffData?.maxOrders}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No unassigned orders available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Ready Orders - Server Assignment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Ready Orders - Server Assignment
                  <Badge variant="outline" className="ml-2 bg-green-100 text-green-700">
                    {readyOrders.length} ready
                  </Badge>
                  {readyOrders.length > 0 && (
                    <Badge variant="destructive" className="ml-2 animate-pulse">
                      Assign Now!
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {readyOrders.length > 0 ? (
                  <div className="space-y-4">
                    {/* Server Staff Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800 font-medium mb-1">Available Server Staff:</p>
                      <div className="flex flex-wrap gap-2">
                        {serverStaff.map(server => (
                          <Badge key={server.id} variant="outline" className="text-xs bg-blue-100 text-blue-700">
                            {server.name} ({server.role})
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-blue-600 mt-2">
                        Includes: Servers, Waiters, Waitresses, Hosts, Bartenders, Baristas, Sommeliers, Bussers, Runners, Cashiers, Delivery Drivers, AND Kitchen Staff (Chefs, Line Cooks, etc.) for serving ready orders
                      </p>
                    </div>
                    
                    {/* Server Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {serverStaff.map(server => (
                        <Card 
                          key={server.id} 
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            !server.isAvailable ? 'opacity-50' : ''
                          } ${selectedServer === server.id ? 'ring-2 ring-green-500' : ''}`}
                          onClick={() => server.isAvailable && setSelectedServer(server.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-green-100 text-green-700">
                                  <User className="h-4 w-4" />
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium truncate">{server.name}</p>
                                  {!server.isAvailable && (
                                    <Badge variant="destructive" className="text-xs">Busy</Badge>
                                  )}
                                </div>
                                <Badge variant="outline" className="text-xs bg-green-100 text-green-700">
                                  {server.role}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Current Orders</span>
                                <span className="font-medium text-green-600">
                                  {server.currentOrders}/{server.maxOrders}
                                </span>
                              </div>
                              <Progress 
                                value={(server.currentOrders / server.maxOrders) * 100} 
                                className="h-2"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Ready Orders for Assignment */}
                    {selectedServer && (
                      <div className="border-t pt-4">
                        <div className="text-sm font-medium mb-2">
                          Select ready orders for {selectedServerData?.name}:
                        </div>
                        <div className="space-y-2">
                          {readyOrders.map(order => (
                            <div key={order.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                              <Checkbox
                                checked={selectedReadyOrders.includes(order.id)}
                                onCheckedChange={(checked) => handleReadyOrderSelection(order.id, checked as boolean)}
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">#{order.id?.substring(0, 6)}</span>
                                  <Badge variant="outline" className="text-xs bg-green-100 text-green-700">
                                    {order.items?.length || 0} items
                                  </Badge>
                                  <Badge className="text-xs bg-green-500 text-white">
                                    READY
                                  </Badge>
                                </div>
                                <div className="text-sm text-gray-500">
                                  {order.customer_name}
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCallServer(order.id, selectedServer)}
                                className="touch-target"
                              >
                                <Volume2 className="h-4 w-4 mr-1" />
                                Call
                              </Button>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex items-center gap-3 pt-4 border-t">
                          <Button
                            onClick={handleAssignServer}
                            disabled={selectedReadyOrders.length === 0}
                            className="touch-target bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Assign {selectedReadyOrders.length} Order{selectedReadyOrders.length !== 1 ? 's' : ''}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setSelectedReadyOrders([])}
                          >
                            Clear Selection
                          </Button>
                          <div className="ml-auto text-sm text-gray-500">
                            Server capacity: {selectedServerData?.currentOrders}/{selectedServerData?.maxOrders}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No ready orders available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Current Assignments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Current Assignments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {orders.filter(order => order.assigned_to).length > 0 ? (
                  <div className="space-y-2">
                    {orders.filter(order => order.assigned_to).map(order => {
                      const staff = kitchenStaff.find(s => s.id === order.assigned_to)
                      return (
                        <div key={order.id} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">#{order.id?.substring(0, 6)}</span>
                              <Badge variant="outline" className="text-xs">
                                {order.items?.length || 0} items
                              </Badge>
                              <Badge variant={order.status === 'preparing' ? 'default' : 'secondary'}>
                                {order.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-500">
                              Assigned to: {staff?.name || 'Unknown'}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnassignOrder(order.id)}
                          >
                            Unassign
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No current assignments</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Staff Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Staff Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(kitchenStaff.reduce((sum, s) => sum + s.efficiency, 0) / kitchenStaff.length)}%
                    </div>
                    <div className="text-sm text-green-700">Average Efficiency</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {kitchenStaff.reduce((sum, s) => sum + s.currentOrders, 0)}
                    </div>
                    <div className="text-sm text-blue-700">Active Orders</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round(kitchenStaff.reduce((sum, s) => sum + (s.currentOrders / s.maxOrders), 0) / kitchenStaff.length * 100)}%
                    </div>
                    <div className="text-sm text-purple-700">Average Utilization</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
