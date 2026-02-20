'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AlertCircle, Plus, Search, Edit, Trash2, Package, TrendingDown, Bell, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { useInventory } from '@/hooks/use-inventory'
import { useRestaurants } from '@/hooks/use-restaurants'
import { Store } from 'lucide-react'

interface InventoryItem {
  id: string
  item_name: string
  quantity: number
  unit: string
  reorder_level: number
  last_updated: string
}

/**
 * Inventory Page
 * Route: /inventory
 * Manage inventory and stock levels
 * Manager & Admin only access
 */
export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [filterCategory, setFilterCategory] = useState('all')
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string>('')
  const [newItem, setNewItem] = useState({
    item_name: '',
    quantity: 0,
    unit: 'pcs',
    reorder_level: 10
  })
  
  const router = useRouter()
  
  // Use real data from hooks
  const { restaurants, isLoading: restaurantsLoading } = useRestaurants()
  const { inventory, isLoading: itemsLoading, mutate } = useInventory(selectedRestaurant)

  // Check user role on mount
  useEffect(() => {
    const role = localStorage.getItem('userRole')
    setUserRole(role || '')

    // Redirect non-managers and non-admins
    if (role !== 'manager' && role !== 'admin') {
      toast.error('Access Denied: Only managers and administrators can access inventory management.')
      router.push('/dashboard')
      return
    }
  }, [router])
  
  // Set default restaurant when data loads
  useEffect(() => {
    if (restaurants.length > 0 && !selectedRestaurant) {
      setSelectedRestaurant(restaurants[0].id)
    }
  }, [restaurants, selectedRestaurant])

  const loadInventory = async () => {
    // Data is now loaded by the useInventory hook
    mutate()
  }

  const isLowStock = (item: InventoryItem) => item.quantity < item.reorder_level

  const lowStockItems = inventory.filter(isLowStock)

  const filteredInventory = inventory.filter(
    (item: InventoryItem) =>
      item.item_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddItem = async () => {
    if (!newItem.item_name || newItem.quantity <= 0 || !selectedRestaurant) {
      toast.error('Please fill in all required fields')
      return
    }
    
    try {
      const itemData = {
        restaurant_id: selectedRestaurant,
        item_name: newItem.item_name,
        quantity: newItem.quantity,
        unit: newItem.unit,
        reorder_level: newItem.reorder_level
      }

      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(itemData)
      })

      if (!response.ok) {
        throw new Error('Failed to add inventory item')
      }

      setNewItem({ item_name: '', quantity: 0, unit: 'pcs', reorder_level: 10 })
      setShowAddDialog(false)
      mutate() // Refresh inventory data
      toast.success('Item added to inventory')
    } catch (error) {
      console.error('[Inventory] Error adding item:', error)
      toast.error('Failed to add item')
    }
  }

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item)
    setNewItem({
      item_name: item.item_name,
      quantity: item.quantity,
      unit: item.unit,
      reorder_level: item.reorder_level
    })
    setShowAddDialog(true)
  }

  const handleUpdateItem = async () => {
    if (!editingItem || !newItem.item_name || newItem.quantity <= 0) {
      toast.error('Please fill in all required fields')
      return
    }
    
    try {
      const updateData = {
        item_name: newItem.item_name,
        quantity: newItem.quantity,
        unit: newItem.unit,
        reorder_level: newItem.reorder_level
      }

      const response = await fetch(`/api/inventory/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        throw new Error('Failed to update inventory item')
      }

      setEditingItem(null)
      setNewItem({ item_name: '', quantity: 0, unit: 'pcs', reorder_level: 10 })
      setShowAddDialog(false)
      mutate() // Refresh inventory data
      toast.success('Item updated successfully')
    } catch (error) {
      console.error('[Inventory] Error updating item:', error)
      toast.error('Failed to update item')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/inventory/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete inventory item')
      }

      mutate() // Refresh inventory data
      toast.success('Item removed from inventory')
    } catch (error) {
      console.error('[Inventory] Error deleting item:', error)
      toast.error('Failed to delete item')
    }
  }

  const handleRestock = async (id: string) => {
    const item = inventory.find((i: InventoryItem) => i.id === id)
    if (item) {
      try {
        const restockAmount = item.reorder_level * 2 - item.quantity
        const response = await fetch(`/api/inventory/${id}/restock`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify({ quantity: restockAmount })
        })

        if (!response.ok) {
          throw new Error('Failed to restock item')
        }

        mutate() // Refresh inventory data
        toast.success(`Restocked ${item.item_name} with ${restockAmount} ${item.unit}`)
      } catch (error) {
        console.error('[Inventory] Error restocking item:', error)
        toast.error('Failed to restock item')
      }
    }
  }

  // Show loading or access denied state while checking role
  if (!userRole) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking permissions...</p>
          </div>
        </div>
      </div>
    )
  }

  if (userRole !== 'manager' && userRole !== 'admin') {
    return (
      <div className="container mx-auto py-8">
        <Alert className="max-w-2xl mx-auto">
          <Shield className="h-4 w-4" />
          <AlertDescription className="text-center">
            You don't have permission to access this page. Inventory management is only available to managers and administrators.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 min-h-screen">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Inventory</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Manage stock levels and supplies</p>
            </div>
            <Button 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25"
              onClick={() => setShowAddDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>

      {/* Restaurant Selector */}
      <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-t-lg border-b border-gray-100 dark:border-slate-700">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Store className="h-5 w-5 text-blue-600" />
            Select Restaurant
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <Select value={selectedRestaurant || ''} onValueChange={setSelectedRestaurant} disabled={restaurantsLoading}>
            <SelectTrigger className="h-12 bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600">
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

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900">Low Stock Alert</h3>
              <p className="text-sm text-amber-800 mt-1">
                {lowStockItems.length} item{lowStockItems.length !== 1 ? 's' : ''} below reorder level:
              </p>
              <div className="mt-2 space-y-1">
                {lowStockItems.map((item: InventoryItem) => (
                  <div key={item.id} className="text-sm text-amber-800 flex justify-between">
                    <span>
                      {item.item_name}: {item.quantity}/{item.reorder_level} {item.unit}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => handleRestock(item.id)}
                    >
                      Order Now
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{inventory.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Low Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-600">{lowStockItems.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">In Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{inventory.length - lowStockItems.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Stock Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {((((inventory.length - lowStockItems.length) / inventory.length) * 100) || 0).toFixed(0)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Search Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search by item name or supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-12 bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 rounded-t-lg border-b border-gray-100 dark:border-slate-700">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Inventory Items</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {itemsLoading ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              Loading inventory...
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              {searchTerm ? 'No items found' : 'No inventory items'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-slate-700/50">
                    <TableHead className="font-semibold text-gray-900 dark:text-white">Item Name</TableHead>
                    <TableHead className="text-right font-semibold text-gray-900 dark:text-white">Quantity</TableHead>
                    <TableHead className="text-right font-semibold text-gray-900 dark:text-white">Reorder Level</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-white">Last Updated</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-white">Status</TableHead>
                    <TableHead className="text-right font-semibold text-gray-900 dark:text-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.map((item: InventoryItem) => (
                    <TableRow
                      key={item.id}
                      className={`hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${isLowStock(item) ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}`}
                    >
                      <TableCell className="font-semibold text-gray-900 dark:text-white">{item.item_name}</TableCell>
                      <TableCell className="text-right text-gray-700 dark:text-gray-300">
                        {item.quantity} {item.unit}
                      </TableCell>
                      <TableCell className="text-right text-gray-700 dark:text-gray-300">{item.reorder_level} {item.unit}</TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400">{new Date(item.last_updated).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {isLowStock(item) ? (
                          <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-medium">
                            Low Stock
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                            In Stock
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditItem(item)}
                          title="Edit item"
                          className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          title="Delete item"
                          className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Item Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="itemName">Item Name</Label>
                <Input
                  id="itemName"
                  value={newItem.item_name}
                  onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
                  placeholder="Enter item name"
                />
              </div>
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="unit">Unit</Label>
                <Select value={newItem.unit} onValueChange={(value) => setNewItem({ ...newItem, unit: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pcs">Pieces</SelectItem>
                    <SelectItem value="kg">Kilograms</SelectItem>
                    <SelectItem value="lbs">Pounds</SelectItem>
                    <SelectItem value="liters">Liters</SelectItem>
                    <SelectItem value="boxes">Boxes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="reorderLevel">Reorder Level</Label>
                <Input
                  id="reorderLevel"
                  type="number"
                  value={newItem.reorder_level}
                  onChange={(e) => setNewItem({ ...newItem, reorder_level: parseInt(e.target.value) || 0 })}
                  placeholder="10"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={editingItem ? handleUpdateItem : handleAddItem}>
                {editingItem ? 'Update' : 'Add'} Item
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
