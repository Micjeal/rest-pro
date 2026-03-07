'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  BarChart3, 
  ShoppingCart, 
  ChefHat, 
  Menu as MenuIcon, 
  Package, 
  Receipt, 
  TrendingUp, 
  Settings,
  Users
} from 'lucide-react'
import { getRolesByCategory, type RestaurantRole } from '@/components/users/role-definitions'
import { useState, useEffect, useMemo, useCallback } from 'react'

interface NavItem {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  active: boolean
}

export function MainNavigation() {
  const pathname = usePathname()
  const [userRole, setUserRole] = useState<string>('')

  // Memoized role categories
  const roleCategories = useMemo(() => ({
    kitchenRoles: getRolesByCategory('Kitchen').map(r => r.value),
    managementRoles: getRolesByCategory('Management').map(r => r.value),
    frontOfHouseRoles: getRolesByCategory('Front of House').map(r => r.value),
    supportRoles: getRolesByCategory('Support').map(r => r.value)
  }), [])

  // Set user role on mount
  useEffect(() => {
    const role = localStorage.getItem('userRole') || 'cashier'
    setUserRole(role)
  }, [])

  // Memoized isActive function
  const isActive = useCallback((path: string) => {
    if (path === '/dashboard') return pathname === '/dashboard'
    if (path === '/pos') return pathname.includes('/pos')
    if (path === '/kitchen') return pathname.includes('/kitchen')
    if (path === '/menu') return pathname.includes('/menu')
    if (path === '/inventory') return pathname.includes('/inventory')
    if (path === '/receipts') return pathname.includes('/receipts')
    if (path === '/reports') return pathname.includes('/reports')
    if (path === '/settings') return pathname.includes('/settings')
    return pathname === path
  }, [pathname])

  // Memoized navigation items based on user role
  const navItems = useMemo(() => {
    const items: NavItem[] = []
    
    // Dashboard - Management Roles Only
    if (roleCategories.managementRoles.includes(userRole as RestaurantRole)) {
      items.push({
        href: '/dashboard',
        icon: BarChart3,
        label: 'Dashboard',
        active: isActive('/dashboard')
      })
    }

    // POS - Front of House & Support Staff
    if (roleCategories.frontOfHouseRoles.includes(userRole as RestaurantRole) || roleCategories.supportRoles.includes(userRole as RestaurantRole)) {
      items.push({
        href: '/pos',
        icon: ShoppingCart,
        label: 'POS',
        active: isActive('/pos')
      })
    }

    // Kitchen Display - Kitchen & Management Staff
    if (roleCategories.kitchenRoles.includes(userRole as RestaurantRole) || roleCategories.managementRoles.includes(userRole as RestaurantRole)) {
      items.push({
        href: '/kitchen',
        icon: ChefHat,
        label: 'Kitchen',
        active: isActive('/kitchen')
      })
    }

    // Menu Management - Management & Front of House Staff
    if (roleCategories.managementRoles.includes(userRole as RestaurantRole) || roleCategories.frontOfHouseRoles.includes(userRole as RestaurantRole)) {
      items.push({
        href: '/menu',
        icon: MenuIcon,
        label: 'Menu',
        active: isActive('/menu')
      })
    }

    // Inventory - Manager & Admin only
    if (userRole === 'manager' || userRole === 'admin') {
      items.push({
        href: '/inventory',
        icon: Package,
        label: 'Inventory',
        active: isActive('/inventory')
      })
    }

    // Receipts - Front of House & Support Staff
    if (roleCategories.frontOfHouseRoles.includes(userRole as RestaurantRole) || roleCategories.supportRoles.includes(userRole as RestaurantRole)) {
      items.push({
        href: '/receipts',
        icon: Receipt,
        label: 'Receipts',
        active: isActive('/receipts')
      })
    }

    // Reports - Management Roles Only
    if (roleCategories.managementRoles.includes(userRole as RestaurantRole)) {
      items.push({
        href: '/reports',
        icon: TrendingUp,
        label: 'Reports',
        active: isActive('/reports')
      })
    }

    // Settings - Management Roles Only
    if (roleCategories.managementRoles.includes(userRole as RestaurantRole)) {
      items.push({
        href: '/settings',
        icon: Settings,
        label: 'Settings',
        active: isActive('/settings')
      })
    }

    // Users - Admin Only
    if (userRole === 'admin') {
      items.push({
        href: '/users',
        icon: Users,
        label: 'Users',
        active: isActive('/users')
      })
    }

    return items
  }, [userRole, roleCategories, isActive])

  if (navItems.length === 0) {
    return null
  }

  return (
    <nav className="hidden md:flex items-center space-x-1">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
            item.active
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800"
          )}
        >
          <item.icon className="h-4 w-4 mr-2" />
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
