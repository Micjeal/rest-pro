'use client'

import { useMenuItems } from '@/hooks/use-menu-items'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface MenuItemsListProps {
  restaurantId: string
  menuId: string
}

export function MenuItemsList({ restaurantId, menuId }: MenuItemsListProps) {
  const { items, isLoading, mutate } = useMenuItems(menuId)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const response = await fetch(`/api/menu-items?id=${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete')
      toast.success('Item deleted')
      mutate()
    } catch (error) {
      toast.error('Failed to delete item')
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading items...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-900">Menu Items</h4>
        <Link href={`/dashboard/${restaurantId}/menus/${menuId}/items/new`}>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 px-4 py-6 text-center">
          <p className="text-sm text-gray-600">No items in this menu</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item: any) => (
            <Card key={item.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{item.name}</h5>
                    {item.description && (
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm font-semibold text-gray-900">
                        ${parseFloat(item.price).toFixed(2)}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.availability
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.availability ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
