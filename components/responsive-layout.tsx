'use client'

import React, { useEffect, useState, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ResponsiveLayoutProps {
  children: ReactNode
  className?: string
  enablePullToRefresh?: boolean
  onPullToRefresh?: () => void
}

export function ResponsiveLayout({ 
  children, 
  className,
  enablePullToRefresh = false,
  onPullToRefresh
}: ResponsiveLayoutProps) {
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [isPulling, setIsPulling] = useState(false)

  // Detect screen size
  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth
      if (width < 768) {
        setScreenSize('mobile')
      } else if (width < 1024) {
        setScreenSize('tablet')
      } else {
        setScreenSize('desktop')
      }
    }

    updateScreenSize()
    window.addEventListener('resize', updateScreenSize)
    return () => window.removeEventListener('resize', updateScreenSize)
  }, [])

  // Pull to refresh functionality
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!enablePullToRefresh) return
    setTouchStart(e.targetTouches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!enablePullToRefresh) return
    
    const currentTouch = e.targetTouches[0].clientY
    const pullDistance = currentTouch - touchStart
    
    if (pullDistance > 0 && window.scrollY === 0) {
      setIsPulling(true)
      e.preventDefault()
    }
  }

  const handleTouchEnd = () => {
    if (!enablePullToRefresh || !isPulling) return
    
    const pullDistance = touchEnd - touchStart
    if (pullDistance > 100 && onPullToRefresh) {
      onPullToRefresh()
    }
    
    setIsPulling(false)
    setTouchStart(0)
    setTouchEnd(0)
  }

  return (
    <div 
      className={cn(
        'min-h-screen bg-background',
        'mobile:touch-manipulation',
        className
      )}
      data-screen-size={screenSize}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      {enablePullToRefresh && isPulling && (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4 animate-slide-down">
          <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm">
            Pull to refresh...
          </div>
        </div>
      )}
      
      {/* Main content with responsive container */}
      <div className="@container mx-auto w-full">
        {children}
      </div>
      
      {/* Responsive utilities */}
      <style jsx>{`
        @container (min-width: 768px) {
          .mobile-only { display: none; }
          .tablet-up { display: block; }
        }
        
        @container (min-width: 1024px) {
          .tablet-only { display: none; }
          .desktop-up { display: block; }
        }
      `}</style>
    </div>
  )
}

// Helper components for responsive design
export function ResponsiveGrid({ 
  children, 
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 4 
}: {
  children: ReactNode
  cols?: { mobile: number, tablet: number, desktop: number }
  gap?: number
}) {
  return (
    <div className={`
      grid gap-${gap}
      grid-cols-${cols.mobile}
      md:grid-cols-${cols.tablet}
      lg:grid-cols-${cols.desktop}
      @lg:grid-cols-${cols.desktop}
      @md:grid-cols-${cols.tablet}
      grid-cols-${cols.mobile}
    `}>
      {children}
    </div>
  )
}

export function ResponsiveFlex({
  children,
  direction = { mobile: 'col', tablet: 'row', desktop: 'row' },
  justify = 'between',
  align = 'center',
  wrap = false
}: {
  children: ReactNode
  direction?: { mobile: string, tablet: string, desktop: string }
  justify?: string
  align?: string
  wrap?: boolean
}) {
  return (
    <div className={`
      flex
      flex-${direction.mobile}
      md:flex-${direction.tablet}
      lg:flex-${direction.desktop}
      justify-${justify}
      items-${align}
      ${wrap ? 'flex-wrap' : 'flex-nowrap'}
      gap-4
    `}>
      {children}
    </div>
  )
}

export function MobileOnly({ children }: { children: ReactNode }) {
  return (
    <div className="block md:hidden lg:hidden">
      {children}
    </div>
  )
}

export function TabletOnly({ children }: { children: ReactNode }) {
  return (
    <div className="hidden md:block lg:hidden">
      {children}
    </div>
  )
}

export function DesktopOnly({ children }: { children: ReactNode }) {
  return (
    <div className="hidden md:hidden lg:block">
      {children}
    </div>
  )
}

export function TouchTarget({ 
  children, 
  size = 'default',
  className = '' 
}: {
  children: ReactNode
  size?: 'sm' | 'default' | 'lg'
  className?: string
}) {
  const sizeClasses = {
    sm: 'min-h-[44px] min-w-[44px]',
    default: 'min-h-[48px] min-w-[48px]',
    lg: 'min-h-[52px] min-w-[52px]'
  }

  return (
    <div className={cn(
      'touch-manipulation',
      sizeClasses[size],
      className
    )}>
      {children}
    </div>
  )
}
