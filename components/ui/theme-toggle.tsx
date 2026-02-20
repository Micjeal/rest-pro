'use client'

import { Moon, Sun, ChefHat, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/contexts/theme-context'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          {getThemeIcon()}
          <span className="ml-2 hidden sm:inline">{getThemeLabel()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => setTheme('kitchen-light')} className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-gradient-to-br from-orange-100 to-yellow-100 border border-orange-200"></div>
          <div>
            <div className="font-medium">Kitchen Light</div>
            <div className="text-xs text-gray-500">Optimized for bright kitchens</div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('kitchen-dark')} className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-600"></div>
          <div>
            <div className="font-medium">Kitchen Dark</div>
            <div className="text-xs text-gray-500">Optimized for dark kitchens</div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('light')} className="flex items-center gap-2">
          <Sun className="h-4 w-4 text-yellow-500" />
          <div>
            <div className="font-medium">Light Mode</div>
            <div className="text-xs text-gray-500">Standard light theme</div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')} className="flex items-center gap-2">
          <Moon className="h-4 w-4 text-blue-500" />
          <div>
            <div className="font-medium">Dark Mode</div>
            <div className="text-xs text-gray-500">Standard dark theme</div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
