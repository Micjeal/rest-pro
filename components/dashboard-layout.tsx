'use client'

import { SidebarNavigation } from '@/components/pos/sidebar-navigation'
import { useSidebar } from '@/hooks/use-sidebar'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  headerAction?: React.ReactNode
}

export function DashboardLayout({ children, title, subtitle, headerAction }: DashboardLayoutProps) {
  const { isDesktopCollapsed, toggleDesktopSidebar } = useSidebar()

  return (
    <div className="flex">
      <SidebarNavigation />
      
      {/* Floating Toggle Button - Always visible */}
      <Button
        variant="outline"
        size="icon"
        className={`fixed top-4 z-50 hidden lg:flex bg-white dark:bg-slate-800 shadow-lg border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-200 ${
          isDesktopCollapsed ? 'left-4' : 'left-72'
        }`}
        onClick={toggleDesktopSidebar}
        aria-label={isDesktopCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <Menu className="h-4 w-4" />
      </Button>
      
      {/* Main Content Area */}
      <main 
        id="main-content" 
        className={`flex-1 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 min-h-screen transition-all duration-300 relative ${
          isDesktopCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Page Title */}
                {(title || subtitle) && (
                  <div>
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
                <div>
                  {headerAction}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Page Content */}
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}
