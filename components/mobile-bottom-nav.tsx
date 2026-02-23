'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  ShoppingCart, 
  BarChart3, 
  Receipt, 
  Package, 
  Settings, 
  ChefHat,
  Menu as MenuIcon,
  Users
} from 'lucide-react'
import { getRolesByCategory, type RestaurantRole } from '@/components/users/role-definitions'
import { useState, useEffect } from 'react'
import { TouchTarget } from '@/components/responsive-layout'

interface MobileBottomNavProps {
  userRole?: string
}

export function MobileBottomNav({ userRole: propUserRole }: MobileBottomNavProps = {}) {
  const pathname = usePathname()
  const [userRole, setUserRole] = useState<string>(propUserRole || '')
  const [restaurants, setRestaurants] = useState<any[]>([])

  useEffect(() => {
    const role = propUserRole || localStorage.getItem('userRole') || 'cashier'
    setUserRole(role)
    
    // Fetch restaurants for navigation
    const fetchRestaurants = async () => {
      try {
        const token = localStorage.getItem('auth_token')
        if (!token) return

        const response = await fetch('/api/restaurants', {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        if (response.ok) {
          const restaurants = await response.json()
          setRestaurants(restaurants)
        }
      } catch (error) {
        console.error('Error fetching restaurants:', error)
      }
    }

    fetchRestaurants()
  }, [propUserRole])

  // Get role categories
  const kitchenRoles = getRolesByCategory('Kitchen').map(r => r.value)
  const managementRoles = getRolesByCategory('Management').map(r => r.value)
  const frontOfHouseRoles = getRolesByCategory('Front of House').map(r => r.value)
  const supportRoles = getRolesByCategory('Support').map(r => r.value)

  // Get the first available restaurant ID for navigation
  const getFirstRestaurantId = () => {
    if (restaurants.length > 0) {
      const firstId = restaurants[0].id
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      if (uuidRegex.test(firstId)) {
        return firstId
      }
    }
    return null
  }

  const firstRestaurantId = getFirstRestaurantId()

  const isActive = (path: string) => {
    if (path === '/pos') return pathname.includes('/pos')
    if (path === '/kitchen') return pathname.includes('/kitchen')
    if (path === '/dashboard') return pathname === '/dashboard'
    if (path === '/menu') return pathname.includes('/menu')
    if (path === '/inventory') return pathname.includes('/inventory')
    if (path === '/receipts') return pathname.includes('/receipts')
    if (path === '/reports') return pathname.includes('/reports')
    if (path === '/settings') return pathname.includes('/settings')
    return pathname === path
  }

  // Navigation items based on user role
  const navItems = [
    // Dashboard - Management Roles Only
    ...(managementRoles.includes(userRole as RestaurantRole) ? [{
      href: '/dashboard',
      icon: BarChart3,
      label: 'Dashboard',
      active: isActive('/dashboard')
    }] : []),

    // POS - Front of House & Support Staff
    ...(frontOfHouseRoles.includes(userRole as RestaurantRole) || supportRoles.includes(userRole as RestaurantRole) ? [{
      href: '/pos',
      icon: ShoppingCart,
      label: 'POS',
      active: isActive('/pos')
    }] : []),

    // Kitchen Display - Kitchen & Management Staff
    ...(kitchenRoles.includes(userRole as RestaurantRole) || managementRoles.includes(userRole as RestaurantRole) ? [{
      href: '/kitchen',
      icon: ChefHat,
      label: 'Kitchen',
      active: isActive('/kitchen')
    }] : []),

    // Menu Management - Management & Front of House Staff
    ...(managementRoles.includes(userRole as RestaurantRole) || frontOfHouseRoles.includes(userRole as RestaurantRole) ? [{
      href: '/menu',
      icon: MenuIcon,
      label: 'Menu',
      active: isActive('/menu')
    }] : []),

    // Inventory - Manager & Admin only
    ...(userRole === 'manager' || userRole === 'admin' ? [{
      href: '/inventory',
      icon: Package,
      label: 'Inventory',
      active: isActive('/inventory')
    }] : []),

    // Receipts - Front of House & Support Staff
    ...(frontOfHouseRoles.includes(userRole as RestaurantRole) || supportRoles.includes(userRole as RestaurantRole) ? [{
      href: '/receipts',
      icon: Receipt,
      label: 'Receipts',
      active: isActive('/receipts')
    }] : []),

    // Reports - Manager & Admin only
    ...(userRole === 'manager' || userRole === 'admin' ? [{
      href: '/reports',
      icon: BarChart3,
      label: 'Reports',
      active: isActive('/reports')
    }] : []),

    // Settings - Admin only
    { href: '/settings', icon: Settings, label: 'Settings', active: isActive('/settings') }
  ].filter(Boolean)

  // Limit to 5 items for mobile bottom nav
  const limitedNavItems = navItems.slice(0, 5)

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {limitedNavItems.map((item: any) => (
          <TouchTarget key={item.href} size="sm">
            <Link href={item.href}>
              <Button
                variant={item.active ? 'default' : 'ghost'}
                size="sm"
                className={`
                  flex flex-col items-center justify-center h-12 w-12 rounded-lg
                  transition-all duration-200
                  ${item.active 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }
                `}
              >
                <item.icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </Button>
            </Link>
          </TouchTarget>
        ))}
      </div>
      
      {/* Safe area padding for notched screens */}
      <div className="h-safe-area-inset-bottom bg-white dark:bg-slate-900" />
    </div>
  )
}

// Hook to get safe area inset for mobile devices
export function useSafeAreaInsets() {
  const [insets, setInsets] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  })

  useEffect(() => {
    const updateInsets = () => {
      const style = getComputedStyle(document.documentElement)
      setInsets({
        top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0'),
        right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0'),
        bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0'),
        left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0')
      })
    }

    updateInsets()
    window.addEventListener('resize', updateInsets)
    return () => window.removeEventListener('resize', updateInsets)
  }, [])

  return insets
}
