'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { MenuList } from '@/components/menu-list'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'
import { Plus, Shield } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

/**
 * Menus Page
 * Route: /dashboard/[id]/menus
 * Manage restaurant menus
 * Available to all users
 */
export default function MenusPage() {
  const params = useParams()
  const restaurantId = params.id as string

  return (
    <DashboardLayout 
      title="Menus"
      subtitle="Manage your restaurant menus"
      headerAction={
        <Link href={`/dashboard/${restaurantId}/menus/new`}>
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25">
            <Plus className="h-4 w-4 mr-2" />
            New Menu
          </Button>
        </Link>
      }
    >
      <MenuList restaurantId={restaurantId} />
    </DashboardLayout>
  )
}
