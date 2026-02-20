'use client'

import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import { useSidebar } from '@/hooks/use-sidebar'

interface SidebarToggleProps {
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function SidebarToggle({ 
  className = '',
  variant = 'outline',
  size = 'icon'
}: SidebarToggleProps = {}) {
  const { isDesktopCollapsed, toggleDesktopSidebar } = useSidebar()

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={toggleDesktopSidebar}
      aria-label={isDesktopCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
    >
      <Menu className="h-4 w-4" />
    </Button>
  )
}

export function MainContentToggle() {
  console.warn('[MainContentToggle] This component is deprecated and no longer functional')
  return null
}
