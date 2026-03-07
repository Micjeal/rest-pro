'use client'

import { Moon, Sun, ChefHat, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/contexts/theme-context'
import { useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme, toggleTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const getThemeIcon = () => {
    switch (theme) {
      case 'kitchen-light':
        return <ChefHat className="h-4 w-4" />
      case 'kitchen-dark':
        return <ChefHat className="h-4 w-4" />
      case 'light':
        return <Sun className="h-4 w-4" />
      case 'dark':
        return <Moon className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  const getThemeLabel = () => {
    switch (theme) {
      case 'kitchen-light':
        return 'Kitchen Light'
      case 'kitchen-dark':
        return 'Kitchen Dark'
      case 'light':
        return 'Light'
      case 'dark':
        return 'Dark'
      default:
        return 'Theme'
    }
  }

  const getNextTheme = () => {
    const themes: (typeof theme)[] = ['kitchen-light', 'kitchen-dark', 'light', 'dark']
    const currentIndex = themes.indexOf(theme)
    return themes[(currentIndex + 1) % themes.length]
  }

  const nextTheme = getNextTheme()
  const nextThemeIcon = nextTheme === 'kitchen-light' || nextTheme === 'kitchen-dark' 
    ? <ChefHat className="h-4 w-4" />
    : nextTheme === 'light' 
    ? <Sun className="h-4 w-4" />
    : <Moon className="h-4 w-4" />

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={toggleTheme}
        className="kitchen-button kitchen-touch-target min-w-[44px] h-10 w-10 sm:w-auto sm:min-w-[120px] kitchen-bg kitchen-border hover:kitchen-surface transition-all duration-200"
        aria-label={`Current theme: ${getThemeLabel()}. Click to change theme.`}
        title={`Current: ${getThemeLabel()}. Next: ${nextTheme.charAt(0).toUpperCase() + nextTheme.slice(1).replace('-', ' ')}`}
      >
        <span className="flex items-center justify-center gap-2">
          {getThemeIcon()}
          <span className="hidden sm:inline font-medium">{getThemeLabel()}</span>
        </span>
      </Button>
      
      {/* Visual hint for next theme on hover */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div className="flex items-center gap-1 text-xs kitchen-text-secondary bg-kitchen-card px-2 py-1 rounded border kitchen-border shadow-sm">
          <span>Next:</span>
          {nextThemeIcon}
          <span className="capitalize">{nextTheme.replace('-', ' ')}</span>
        </div>
      </div>
    </div>
  )
}
