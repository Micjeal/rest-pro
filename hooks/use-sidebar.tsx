'use client'

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'

interface SidebarContextType {
  isMobileOpen: boolean
  toggleMobileSidebar: () => void
  closeMobileSidebar: () => void
  isDesktopCollapsed: boolean
  toggleDesktopSidebar: () => void
  setDesktopCollapsed: (collapsed: boolean) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export const SidebarProvider: React.FC<{ children: ReactNode }> = ({ children }): ReactNode => {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  
  // Initialize desktop collapsed state from localStorage
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-desktop-collapsed')
      return saved === 'true'
    }
    return false
  })

  // DEBUG: Log provider initialization
  console.log('[SidebarProvider] Initializing, isMobileOpen:', isMobileOpen, 'isDesktopCollapsed:', isDesktopCollapsed)

  // Handle responsive behavior
  useEffect(() => {
    console.log('[SidebarProvider] Resize effect running')
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        // On desktop, close mobile sidebar
        setIsMobileOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Save desktop collapsed state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-desktop-collapsed', isDesktopCollapsed.toString())
    }
  }, [isDesktopCollapsed])

  const toggleMobileSidebar = useCallback(() => {
    setIsMobileOpen(prev => !prev)
  }, [])

  const closeMobileSidebar = useCallback(() => {
    setIsMobileOpen(false)
  }, [])

  const toggleDesktopSidebar = useCallback(() => {
    setIsDesktopCollapsed(prev => !prev)
  }, [])

  const setDesktopCollapsed = useCallback((collapsed: boolean) => {
    setIsDesktopCollapsed(collapsed)
  }, [])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + B to toggle desktop sidebar
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault()
        toggleDesktopSidebar()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleDesktopSidebar])

  return (
    <SidebarContext.Provider
      value={{
        isMobileOpen,
        toggleMobileSidebar,
        closeMobileSidebar,
        isDesktopCollapsed,
        toggleDesktopSidebar,
        setDesktopCollapsed,
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}
