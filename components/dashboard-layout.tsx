'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { SidebarNavigation } from '@/components/pos/sidebar-navigation'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'
import { MainNavigation } from '@/components/main-navigation'
import { useSidebar } from '@/hooks/use-sidebar'
import { SidebarToggle } from '@/components/sidebar-toggle'
import { ResponsiveLayout, MobileOnly, DesktopOnly } from '@/components/responsive-layout'

interface DashboardLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  headerAction?: React.ReactNode
}

export function DashboardLayout({ children, title, subtitle, headerAction }: DashboardLayoutProps) {
  const [isMounted, setIsMounted] = useState(false)
  const { isDesktopCollapsed, toggleDesktopSidebar, isMobileOpen, closeMobileSidebar } = useSidebar()
  const pathname = usePathname()
  const isKitchenPage = pathname.includes('/kitchen')

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <ResponsiveLayout>
      <div className="flex relative min-h-screen">
        <SidebarNavigation />
        
        {/* Main Content Area */}
        <main 
          id="main-content" 
          className={`flex-1 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 min-h-screen transition-all duration-300 relative ${
            isDesktopCollapsed && isMounted ? 'lg:ml-20' : 'lg:ml-64'
          } ml-0`}
        >
          {/* Only show header for non-kitchen pages */}
          {!isKitchenPage && (
            <>
              {/* Desktop Header */}
              <DesktopOnly>
                <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700">
                  <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        {/* Sidebar Toggle */}
                        <SidebarToggle showLabel={false} className="kitchen-sidebar-toggle" />
                        
                        {/* Main Navigation */}
                        <MainNavigation />
                        
                        {/* Page Title */}
                        {(title || subtitle) && (
                          <div className="border-l border-gray-200 dark:border-gray-700 pl-6">
                            {title && (
                              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
                            )}
                            {subtitle && (
                              <p className="text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {headerAction && (
                        <div className="flex-shrink-0">
                          {headerAction}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </DesktopOnly>
            </>
          )}
          
          {/* Page Content */}
          <div className={`
            mx-auto 
            px-4 py-8 
            sm:px-6 
            lg:pr-8 lg:pl-0
            lg:max-w-7xl
            ${isKitchenPage ? 'pt-0' : 'pt-20'} // Account for mobile header space
            pb-24 // Account for mobile bottom nav
          `}>
            {children}
          </div>
        </main>
        
        {/* Mobile Bottom Navigation - Mobile Only */}
        <div className="block md:hidden">
          <MobileBottomNav />
        </div>
      </div>
    </ResponsiveLayout>
  )
}
