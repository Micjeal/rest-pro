'use client'

import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { useSidebar } from '@/hooks/use-sidebar'
import { useState, useEffect } from 'react'

interface SidebarToggleProps {
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showLabel?: boolean
}

export function SidebarToggle({ 
  className = '',
  variant = 'outline',
  size = 'icon',
  showLabel = false
}: SidebarToggleProps = {}) {
  const { isDesktopCollapsed, toggleDesktopSidebar, isMobileOpen, toggleMobileSidebar } = useSidebar()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const isCollapsed = isMobile ? !isMobileOpen : isDesktopCollapsed
  const toggleSidebar = isMobile ? toggleMobileSidebar : toggleDesktopSidebar
  const label = isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'

  return (
    <Button
      variant={variant}
      size={size}
      className={`kitchen-button kitchen-touch-target transition-all duration-200 ${className}`}
      onClick={toggleSidebar}
      aria-label={label}
      title={label}
    >
      <span className="flex items-center justify-center gap-2">
        {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        {showLabel && (
          <span className="hidden sm:inline font-medium">
            {isCollapsed ? 'Show Menu' : 'Hide Menu'}
          </span>
        )}
      </span>
    </Button>
  )
}

export function MainContentToggle() {
  console.warn('[MainContentToggle] This component is deprecated and no longer functional')
  return null
}
