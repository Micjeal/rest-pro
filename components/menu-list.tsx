'use client'

import { useMenus } from '@/hooks/use-menus'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Plus } from 'lucide-react'

interface MenuListProps {
  restaurantId: string
}

export function MenuList({ restaurantId }: MenuListProps) {
  const { menus, isLoading } = useMenus(restaurantId)

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading menus...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Menus</h3>
        <Link href={`/dashboard/${restaurantId}/menus/new`}>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Menu
          </Button>
        </Link>
      </div>

      {menus.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 px-4 py-8 text-center">
          <p className="text-sm text-gray-600">No menus created yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {menus.map((menu: any) => (
            <Card key={menu.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{menu.name}</CardTitle>
                  <Link href={`/dashboard/${restaurantId}/menus/${menu.id}`}>
                    <Button size="sm" variant="outline">
                      Manage
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              {menu.description && (
                <CardContent>
                  <p className="text-sm text-gray-600">{menu.description}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
