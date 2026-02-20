'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { 
  ShoppingCart, 
  BarChart3, 
  Receipt, 
  Package, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Users, 
  ChefHat, 
  Wrench, 
  Hammer 
} from 'lucide-react'
import { getRolesByCategory, getRoleBadgeColor, getRoleLabel, type RestaurantRole } from '@/components/users/role-definitions'
import { useEffect, useState } from 'react'
import { useSidebar } from '@/hooks/use-sidebar'

interface SidebarNavigationProps {
  onWidthChange?: (width: string) => void
}

export function SidebarNavigation({ onWidthChange }: SidebarNavigationProps = {}) {
  const pathname = usePathname()
  const router = useRouter()
  const [userRole, setUserRole] = useState<string>('')
  const [restaurants, setRestaurants] = useState<any[]>([])
  const { isMobileOpen, toggleMobileSidebar, closeMobileSidebar, isDesktopCollapsed } = useSidebar()

  // Get role categories
  const kitchenRoles = getRolesByCategory('Kitchen').map(r => r.value)
  const managementRoles = getRolesByCategory('Management').map(r => r.value)
  const frontOfHouseRoles = getRolesByCategory('Front of House').map(r => r.value)
  const supportRoles = getRolesByCategory('Support').map(r => r.value)

  useEffect(() => {
    // Get user role from localStorage or session
    const role = localStorage.getItem('userRole') || 'cashier'
    setUserRole(role)
    console.log('[SidebarNavigation] User role:', role)
    
    console.log('[SidebarNavigation] Menu visibility check:', {
      userRole: role,
      isManagement: managementRoles.includes(role as RestaurantRole),
      isKitchen: kitchenRoles.includes(role as RestaurantRole),
      isFrontOfHouse: frontOfHouseRoles.includes(role as RestaurantRole),
      isSupport: supportRoles.includes(role as RestaurantRole),
      shouldShowDashboard: managementRoles.includes(role as RestaurantRole),
      shouldShowKitchen: [...kitchenRoles, ...managementRoles].includes(role as RestaurantRole),
      shouldShowPOS: [...frontOfHouseRoles, ...supportRoles].includes(role as RestaurantRole)
    })
    
    // Fetch real restaurants from API
    const fetchRestaurants = async () => {
      try {
        const token = localStorage.getItem('auth_token')
        if (!token) {
          console.log('[SidebarNavigation] No auth token found')
          return
        }

        const response = await fetch('/api/restaurants', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const restaurants = await response.json()
          setRestaurants(restaurants)
          console.log('[SidebarNavigation] Loaded restaurants:', restaurants)
        } else {
          console.error('[SidebarNavigation] Failed to fetch restaurants:', response.status)
        }
      } catch (error) {
        console.error('[SidebarNavigation] Error fetching restaurants:', error)
      }
    }

    fetchRestaurants()
  }, [])

  // Notify parent if callback provided (for backwards compatibility)
  useEffect(() => {
    if (onWidthChange) {
      onWidthChange(isDesktopCollapsed ? 'w-20' : 'w-64')
    }
  }, [onWidthChange, isDesktopCollapsed])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      localStorage.removeItem('auth_token')
      localStorage.removeItem('userRole')
      router.push('/login')
    } catch (error) {
      console.error('[SidebarNavigation] Logout error:', error)
    }
  }

  const isActive = (path: string) => pathname === path

  // Get the first available restaurant ID for navigation
  const getFirstRestaurantId = () => {
    if (restaurants.length > 0) {
      const firstId = restaurants[0].id
      console.log('[SidebarNavigation] First restaurant ID:', firstId)
      // Validate that it's a proper UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      if (uuidRegex.test(firstId)) {
        return firstId
      } else {
        console.error('[SidebarNavigation] Invalid restaurant ID format:', firstId)
        return null
      }
    }
    return null
  }

  const firstRestaurantId = getFirstRestaurantId()

  // Helper function to create navigation items with tooltips
  const createNavItem = (href: string, icon: React.ReactNode, label: string, isActive: boolean) => {
    const button = (
      <Button
        variant={isActive ? 'default' : 'ghost'}
        className={`w-full justify-start h-11 transition-all duration-200 hover:bg-white/10 ${
          isActive ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : ''
        } ${isDesktopCollapsed ? 'px-3' : ''}`}
      >
        {icon}
        {!isDesktopCollapsed && <span className="ml-3">{label}</span>}
      </Button>
    )

    if (isDesktopCollapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={href}>{button}</Link>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{label}</p>
          </TooltipContent>
        </Tooltip>
      )
    }

    return <Link href={href}>{button}</Link>
  }

  return (
    <>
      {/* Mobile Toggle Button - Always visible on mobile when sidebar is closed */}
      <Button
        variant="outline"
        size="icon"
        className={`fixed top-4 left-4 z-50 transition-all duration-300 ${isMobileOpen ? 'hidden' : 'block lg:hidden'} bg-white dark:bg-slate-800 shadow-lg`}
        onClick={toggleMobileSidebar}
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Overlay for mobile when sidebar is open */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      <TooltipProvider>
      <aside className={`
        ${isDesktopCollapsed ? 'w-20' : 'w-64'} 
        bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white h-screen fixed left-0 top-0 overflow-y-auto transition-all duration-300 z-40
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        shadow-2xl
      `}>
        {/* Header */}
        <div className={`p-5 border-b border-white/10 transition-all duration-300 sticky top-0 bg-slate-900/95 backdrop-blur-sm z-10 ${
          isDesktopCollapsed ? 'px-3' : ''
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30 flex-shrink-0">
                <span className="font-bold text-sm">P</span>
              </div>
              {!isDesktopCollapsed && (
                <div className="overflow-hidden">
                  <h1 className="font-bold text-lg whitespace-nowrap">POS System</h1>
                  <p className="text-xs text-slate-400 capitalize truncate">{userRole}</p>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="flex lg:hidden text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              onClick={closeMobileSidebar}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className={`p-4 space-y-1 transition-all duration-300 ${
          isDesktopCollapsed ? 'px-2' : ''
        }`}>
          {/* Dashboard - Management Roles Only */}
          {managementRoles.includes(userRole as RestaurantRole) && (
            createNavItem('/dashboard', <BarChart3 className="h-5 w-5 flex-shrink-0" />, 'Dashboard', isActive('/dashboard'))
          )}

          {/* POS - Front of House & Support Staff */}
          {[...frontOfHouseRoles, ...supportRoles].includes(userRole as RestaurantRole) && (
            createNavItem('/pos', <ShoppingCart className="h-5 w-5 flex-shrink-0" />, 'POS', isActive('/pos'))
          )}

          {/* Kitchen Display - Kitchen & Management Staff */}
          {[...kitchenRoles, ...managementRoles].includes(userRole as RestaurantRole) && (
            createNavItem(
              userRole === 'chef' ? '/dashboard' : '/kitchen', 
              <ChefHat className="h-5 w-5 flex-shrink-0" />, 
              userRole === 'chef' ? 'Dashboard' : 'Kitchen', 
              isActive(userRole === 'chef' ? '/dashboard' : '/kitchen')
            )
          )}

          {/* Staff Assignment - Kitchen & Management Staff */}
          {[...kitchenRoles, ...managementRoles].includes(userRole as RestaurantRole) && firstRestaurantId && (
            createNavItem(
              `/dashboard/${firstRestaurantId}/staff-assignment`,
              <Users className="h-5 w-5 flex-shrink-0" />,
              'Staff Assignment',
              pathname.includes('/staff-assignment')
            )
          )}

          {/* Receipts - Front of House & Support Staff */}
          {[...frontOfHouseRoles, ...supportRoles].includes(userRole as RestaurantRole) && (
            createNavItem('/receipts', <Receipt className="h-5 w-5 flex-shrink-0" />, 'Receipts', isActive('/receipts'))
          )}

          {/* Menus - Available to all except chef */}
          {userRole !== 'chef' && firstRestaurantId && (
            createNavItem(
              `/dashboard/${firstRestaurantId}/menus`,
              <ChefHat className="h-5 w-5 flex-shrink-0" />,
              'Menus',
              pathname.includes('/menus')
            )
          )}

          {/* Orders - Available to all except chef */}
          {userRole !== 'chef' && firstRestaurantId && (
            createNavItem(
              `/dashboard/${firstRestaurantId}/orders`,
              <ShoppingCart className="h-5 w-5 flex-shrink-0" />,
              'Orders',
              pathname.includes('/orders')
            )
          )}

          {/* Reservations - Available to all except chef */}
          {userRole !== 'chef' && firstRestaurantId && (
            createNavItem(
              `/dashboard/${firstRestaurantId}/reservations`,
              <Users className="h-5 w-5 flex-shrink-0" />,
              'Reservations',
              pathname.includes('/reservations')
            )
          )}

          {/* Inventory - Manager & Admin only */}
          {(userRole === 'manager' || userRole === 'admin') && (
            createNavItem('/inventory', <Package className="h-5 w-5 flex-shrink-0" />, 'Inventory', isActive('/inventory'))
          )}

          {/* Reports - Manager & Admin only */}
          {(userRole === 'manager' || userRole === 'admin') && (
            createNavItem('/reports', <BarChart3 className="h-5 w-5 flex-shrink-0" />, 'Reports', isActive('/reports'))
          )}

          {/* Users - Admin only */}
          {userRole === 'admin' && (
            createNavItem('/users', <Users className="h-5 w-5 flex-shrink-0" />, 'Users', isActive('/users'))
          )}

          {/* Settings - Admin only */}
          {userRole === 'admin' && (
            createNavItem('/settings', <Settings className="h-5 w-5 flex-shrink-0" />, 'Settings', isActive('/settings'))
          )}

          {/* Admin Tools - Admin only */}
          {userRole === 'admin' && (
            <>
              {!isDesktopCollapsed && (
                <div className="border-t border-white/10 pt-2 mt-2">
                  <p className="text-xs text-slate-500 px-2 mb-2 font-medium">Admin Tools</p>
                </div>
              )}
              
              {createNavItem('/setup', <Wrench className="h-5 w-5 flex-shrink-0" />, 'Setup', isActive('/setup'))}
              {createNavItem('/debug', <Hammer className="h-5 w-5 flex-shrink-0" />, 'Debug', isActive('/debug'))}
            </>
          )}
        </nav>

        {/* Logout */}
        <div className={`border-t border-white/10 mt-auto ${
          isDesktopCollapsed ? 'p-2' : 'p-4'
        }`}>
          {isDesktopCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-11 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 px-3"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5 flex-shrink-0" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Logout</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="ghost"
              className="w-full justify-start h-11 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              <span className="ml-3">Logout</span>
            </Button>
          )}
        </div>
      </aside>
      </TooltipProvider>
    </>
  )
}
