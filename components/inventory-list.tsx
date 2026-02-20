'use client'

import { useInventory } from '@/hooks/use-inventory'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { Plus, Trash2, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface InventoryListProps {
  restaurantId: string
}

export function InventoryList({ restaurantId }: InventoryListProps) {
  const { inventory, isLoading, mutate } = useInventory(restaurantId)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const response = await fetch(`/api/inventory?id=${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete')
      toast.success('Item removed from inventory')
      mutate()
    } catch (error) {
      toast.error('Failed to delete item')
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading inventory...</div>
  }

  const lowStockItems = inventory.filter(
    (item: any) => item.quantity <= item.reorder_level
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Inventory Items</h3>
        <Link href={`/dashboard/${restaurantId}/inventory/new`}>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </Link>
      </div>

      {lowStockItems.length > 0 && (
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-900">Low Stock Alert</h4>
              <p className="text-sm text-yellow-800 mt-1">
                {lowStockItems.length} item{lowStockItems.length !== 1 ? 's' : ''} below reorder level
              </p>
            </div>
          </div>
        </div>
      )}

      {inventory.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 px-4 py-8 text-center">
          <p className="text-sm text-gray-600">No inventory items yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {inventory.map((item: any) => (
            <Card key={item.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.item_name}</h4>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {item.unit || 'units'}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Current Stock</span>
                    <span className={`font-semibold ${
                      item.quantity <= item.reorder_level
                        ? 'text-red-600'
                        : 'text-green-600'
                    }`}>
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Reorder Level</span>
                    <span className="font-semibold text-gray-900">{item.reorder_level}</span>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      item.quantity <= item.reorder_level ? 'bg-red-500' : 'bg-green-500'
                    }`}
                    style={{
                      width: `${Math.min((item.quantity / (item.reorder_level * 2)) * 100, 100)}%`,
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
