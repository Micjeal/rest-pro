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
    if (typeof window === 'undefined') return
    
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

  // Swipe gesture handling for mobile
  useEffect(() => {
    if (typeof window === 'undefined') return

    let touchStartX = 0
    let touchEndX = 0
    let touchStartY = 0
    let touchEndY = 0

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX
      touchStartY = e.changedTouches[0].screenY
    }

    const handleTouchMove = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].screenX
      touchEndY = e.changedTouches[0].screenY
    }

    const handleTouchEnd = () => {
      const deltaX = touchEndX - touchStartX
      const deltaY = Math.abs(touchEndY - touchStartY)
      
      // Only handle horizontal swipes (prevent vertical scroll interference)
      if (deltaY > 50) return // Too much vertical movement
      
      const minSwipeDistance = 50
      
      // Swipe right to open sidebar (only from left edge)
      if (deltaX > minSwipeDistance && touchStartX < 20 && !isMobileOpen) {
        setIsMobileOpen(true)
      }
      
      // Swipe left to close sidebar
      if (deltaX < -minSwipeDistance && isMobileOpen) {
        setIsMobileOpen(false)
      }
    }

    // Add touch event listeners
    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchmove', handleTouchMove, { passive: true })
    document.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isMobileOpen])

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
    if (typeof window === 'undefined') return
    
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + B to toggle desktop sidebar
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault()
        toggleDesktopSidebar()
      }
      
      // Escape to close mobile sidebar
      if (event.key === 'Escape' && isMobileOpen) {
        closeMobileSidebar()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleDesktopSidebar, isMobileOpen, closeMobileSidebar])

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
