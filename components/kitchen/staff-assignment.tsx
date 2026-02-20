'use client'

import { useState, useMemo } from 'react'
import { User, Users, ChefHat, Clock, TrendingUp, AlertCircle, Volume2, CheckCircle, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import type { KitchenOrder } from '@/hooks/use-kitchen-orders'

interface KitchenStaff {
  id: string
  name: string
  role: 'chef' | 'sous-chef' | 'line-cook' | 'prep-cook'
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
  role: 'server' | 'waiter' | 'waitress' | 'host'
  avatar?: string
  isAvailable: boolean
  currentOrders: number
  maxOrders: number
  efficiency: number
}

interface StaffAssignmentProps {
  orders: KitchenOrder[]
  onAssignOrder: (orderId: string, staffId: string) => Promise<void>
  onUnassignOrder: (orderId: string) => Promise<void>
  onAssignServer: (orderId: string, serverId: string) => Promise<void>
}

export function StaffAssignment({ orders, onAssignOrder, onUnassignOrder, onAssignServer }: StaffAssignmentProps) {
  const [selectedStaff, setSelectedStaff] = useState<string>('')
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [selectedServer, setSelectedServer] = useState<string>('')
  const [selectedReadyOrders, setSelectedReadyOrders] = useState<string[]>([])

  const staff: KitchenStaff[] = [
    {
      id: '1',
      name: 'Gordon Ramsay',
      role: 'chef',
      isAvailable: true,
      currentOrders: 2,
      maxOrders: 5,
      specialties: ['Main Courses', 'Grill', 'Sauces'],
      efficiency: 95
    },
    {
      id: '2',
      name: 'Julia Child',
      role: 'sous-chef',
      isAvailable: true,
      currentOrders: 3,
      maxOrders: 4,
      specialties: ['French Cuisine', 'Baking', 'Soups'],
      efficiency: 88
    },
    {
      id: '3',
      name: 'Anthony Bourdain',
      role: 'line-cook',
      isAvailable: true,
      currentOrders: 1,
      maxOrders: 3,
      specialties: ['Appetizers', 'Salads', 'Quick Prep'],
      efficiency: 92
    },
    {
      id: '4',
      name: 'Jamie Oliver',
      role: 'prep-cook',
      isAvailable: false,
      currentOrders: 4,
      maxOrders: 4,
      specialties: ['Vegetables', 'Prep Work', 'Ingredients'],
      efficiency: 85
    }
  ]

  const readyOrders = useMemo(() => 
    orders.filter(order => order.status === 'ready'),
    [orders]
  )

  const serverStaff: ServerStaff[] = [
    {
      id: 'server1',
      name: 'Sarah Johnson',
      role: 'server',
      isAvailable: true,
      currentOrders: 3,
      maxOrders: 8,
      efficiency: 92
    },
    {
      id: 'server2',
      name: 'Mike Chen',
      role: 'waiter',
      isAvailable: true,
      currentOrders: 5,
      maxOrders: 8,
      efficiency: 88
    },
    {
      id: 'server3',
      name: 'Emily Davis',
      role: 'waitress',
      isAvailable: false,
      currentOrders: 8,
      maxOrders: 8,
      efficiency: 95
    },
    {
      id: 'server4',
      name: 'James Wilson',
      role: 'host',
      isAvailable: true,
      currentOrders: 2,
      maxOrders: 6,
      efficiency: 85
    }
  ]

  const unassignedOrders = useMemo(() => 
    orders.filter(order => !order.assigned_to && (order.status === 'pending' || order.status === 'preparing')),
    [orders]
  )

  const selectedStaffData = staff.find(s => s.id === selectedStaff)
  const selectedServerData = serverStaff.find(s => s.id === selectedServer)

  const getWorkloadColor = (current: number, max: number) => {
    const percentage = (current / max) * 100
    if (percentage >= 80) return 'text-red-500'
    if (percentage >= 60) return 'text-yellow-500'
    return 'text-green-500'
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'chef': return <ChefHat className="h-4 w-4" />
      case 'sous-chef': return <Users className="h-4 w-4" />
      default: return <User className="h-4 w-4" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'chef': return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
      case 'sous-chef': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
      case 'line-cook': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
      case 'prep-cook': return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const handleAssignOrders = async () => {
    if (!selectedStaff || selectedOrders.length === 0) return

    for (const orderId of selectedOrders) {
      await onAssignOrder(orderId, selectedStaff)
    }
    
    setSelectedOrders([])
    setSelectedStaff('')
  }

  const handleAssignServer = async () => {
    if (!selectedServer || selectedReadyOrders.length === 0) return

    for (const orderId of selectedReadyOrders) {
      await onAssignServer(orderId, selectedServer)
    }
    
    setSelectedReadyOrders([])
    setSelectedServer('')
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Kitchen Staff
            <Badge variant="outline" className="ml-2">
              {staff.filter(s => s.isAvailable).length} available
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {staff.map(member => (
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
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className={getRoleColor(member.role)}>
                        {getRoleIcon(member.role)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{member.name}</p>
                        {!member.isAvailable && (
                          <Badge variant="destructive" className="text-xs">Busy</Badge>
                        )}
                      </div>
                      <Badge variant="outline" className={`text-xs ${getRoleColor(member.role)}`}>
                        {member.role.replace('-', ' ')}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Workload</span>
                      <span className={`font-medium ${getWorkloadColor(member.currentOrders, member.maxOrders)}`}>
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
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {member.specialties.slice(0, 2).map((specialty, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                      {member.specialties.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{member.specialties.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

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
                    <div key={order.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800">
                      <input
                        type="checkbox"
                        id={`order-${order.id}`}
                        checked={selectedOrders.includes(order.id)}
                        onChange={(e) => handleOrderSelection(order.id, e.target.checked)}
                        className="h-4 w-4"
                        aria-label={`Select order ${order.id?.substring(0, 6)} for assignment`}
                        title={`Select order ${order.id?.substring(0, 6)}`}
                      />
                      <label 
                        htmlFor={`order-${order.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">#{order.id?.substring(0, 6)}</span>
                          <Badge variant="outline" className="text-xs">
                            {order.items?.length || 0} items
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {order.customer_name}
                        </div>
                      </label>
                      <div className="text-sm text-gray-500">
                        {order.items?.reduce((sum, item) => sum + item.quantity, 0)} total items
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
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
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
          </CardTitle>
        </CardHeader>
        <CardContent>
          {readyOrders.length > 0 ? (
            <div className="space-y-4">
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
                      <div key={order.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800">
                        <input
                          type="checkbox"
                          id={`ready-order-${order.id}`}
                          checked={selectedReadyOrders.includes(order.id)}
                          onChange={(e) => handleReadyOrderSelection(order.id, e.target.checked)}
                          className="h-4 w-4"
                        />
                        <label 
                          htmlFor={`ready-order-${order.id}`}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">#{order.id?.substring(0, 6)}</span>
                            <Badge variant="outline" className="text-xs bg-green-100 text-green-700">
                              {order.items?.length || 0} items
                            </Badge>
                            <Badge className="text-xs bg-green-500 text-white">
                              READY
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {order.customer_name}
                          </div>
                        </label>
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
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No ready orders available</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Staff Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {Math.round(staff.reduce((sum, s) => sum + s.efficiency, 0) / staff.length)}%
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">Average Efficiency</div>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {staff.reduce((sum, s) => sum + s.currentOrders, 0)}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Active Orders</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {Math.round(staff.reduce((sum, s) => sum + (s.currentOrders / s.maxOrders), 0) / staff.length * 100)}%
              </div>
              <div className="text-sm text-purple-700 dark:text-purple-300">Average Utilization</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
