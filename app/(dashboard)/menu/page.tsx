'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Edit, Save, X, Plus, Trash2 } from 'lucide-react'
import { useRestaurants } from '@/hooks/use-restaurants'
import { useMenus } from '@/hooks/use-menus'
import { useMenuItems } from '@/hooks/use-menu-items'
import { useCurrency } from '@/hooks/use-currency'

interface MenuItem {
  id: string
  menu_id: string
  name: string
  description: string
  price: number
  availability: boolean
  created_at: string
  updated_at: string
}

export default function MenuManagementPage() {
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | undefined>(undefined)
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [editForm, setEditForm] = useState({ name: '', description: '', price: '', availability: true })
  const [isLoading, setIsLoading] = useState(false)
  
  const { restaurants, isLoading: restaurantsLoading } = useRestaurants()
  const { menus, isLoading: menusLoading } = useMenus(selectedRestaurant)
  const { items, isLoading: itemsLoading, mutate } = useMenuItems(selectedMenu)
  const { formatAmount, getCurrencySymbol } = useCurrency({ restaurantId: selectedRestaurant })

  // Set default restaurant when data loads
  useEffect(() => {
    if (restaurants.length > 0 && !selectedRestaurant) {
      setSelectedRestaurant(restaurants[0].id)
    }
  }, [restaurants, selectedRestaurant])

  // Set default menu when data loads
  useEffect(() => {
    if (menus.length > 0 && !selectedMenu) {
      setSelectedMenu(menus[0].id)
    }
  }, [menus, selectedMenu])

  const startEdit = (item: MenuItem) => {
    setEditingItem(item)
    setEditForm({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      availability: item.availability
    })
  }

  const cancelEdit = () => {
    setEditingItem(null)
    setEditForm({ name: '', description: '', price: '', availability: true })
  }

  const saveEdit = async () => {
    if (!editingItem) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/menu-items', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          id: editingItem.id,
          name: editForm.name,
          description: editForm.description,
          price: parseFloat(editForm.price),
          availability: editForm.availability
        })
      })

      if (response.ok) {
        toast.success('Menu item updated successfully')
        cancelEdit()
        mutate() // Refresh the menu items list
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update menu item')
      }
    } catch (error) {
      console.error('Error updating menu item:', error)
      toast.error('Failed to update menu item')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleAvailability = async (item: MenuItem) => {
    try {
      const response = await fetch('/api/menu-items', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          availability: !item.availability
        })
      })

      if (response.ok) {
        toast.success(`Item ${!item.availability ? 'enabled' : 'disabled'} successfully`)
        mutate() // Refresh the menu items list
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update availability')
      }
    } catch (error) {
      console.error('Error updating availability:', error)
      toast.error('Failed to update availability')
    }
  }

  if (restaurantsLoading || menusLoading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Menu Management</h1>
          <p className="text-gray-600">Edit menu items and their prices</p>
        </div>
        
        <div className="flex gap-4">
          <Select value={selectedRestaurant || ''} onValueChange={setSelectedRestaurant}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select restaurant" />
            </SelectTrigger>
            <SelectContent>
              {restaurants.map((restaurant) => (
                <SelectItem key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedMenu || ''} onValueChange={setSelectedMenu}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select menu" />
            </SelectTrigger>
            <SelectContent>
              {menus.map((menu) => (
                <SelectItem key={menu.id} value={menu.id}>
                  {menu.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {itemsLoading ? (
        <div className="text-center py-8">Loading menu items...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No menu items found</p>
          <p className="text-sm text-gray-400">Select a restaurant and menu to view items</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((item: MenuItem) => (
            <Card key={item.id} className="relative">
              <CardContent className="p-4">
                {editingItem?.id === item.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`name-${item.id}`}>Item Name</Label>
                        <Input
                          id={`name-${item.id}`}
                          value={editForm.name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Item name"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`price-${item.id}`}>Price ({getCurrencySymbol()})</Label>
                        <Input
                          id={`price-${item.id}`}
                          type="number"
                          step="0.01"
                          value={editForm.price}
                          onChange={(e) => setEditForm(prev => ({ ...prev, price: e.target.value }))}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor={`description-${item.id}`}>Description</Label>
                      <Input
                        id={`description-${item.id}`}
                        value={editForm.description}
                        onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Item description"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`availability-${item.id}`}
                        checked={editForm.availability}
                        onChange={(e) => setEditForm(prev => ({ ...prev, availability: e.target.checked }))}
                        className="rounded"
                        title="Item Availability"
                      />
                      <Label htmlFor={`availability-${item.id}`}>Available</Label>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={saveEdit} disabled={isLoading} size="sm">
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button onClick={cancelEdit} variant="outline" size="sm">
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <Badge variant={item.availability ? "default" : "secondary"}>
                          {item.availability ? "Available" : "Unavailable"}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-2">{item.description}</p>
                      <div className="text-2xl font-bold text-green-600">
                        {formatAmount(item.price)}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => toggleAvailability(item)}
                        variant={item.availability ? "outline" : "default"}
                        size="sm"
                      >
                        {item.availability ? "Disable" : "Enable"}
                      </Button>
                      <Button onClick={() => startEdit(item)} size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
