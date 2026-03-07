'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

interface EnhancedToggleProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  children: React.ReactNode
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
  disabled?: boolean
  className?: string
  icon?: React.ReactNode
  showLabel?: boolean
  touchOptimized?: boolean
}

export function EnhancedToggle({
  checked,
  onCheckedChange,
  children,
  variant = 'default',
  size = 'default',
  disabled = false,
  className = '',
  icon,
  showLabel = true,
  touchOptimized = true
}: EnhancedToggleProps) {
  const [isPressed, setIsPressed] = useState(false)

  const handleClick = () => {
    if (!disabled) {
      onCheckedChange(!checked)
    }
  }

  const handleMouseDown = () => setIsPressed(true)
  const handleMouseUp = () => setIsPressed(false)
  const handleMouseLeave = () => setIsPressed(false)

  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    default: touchOptimized ? 'h-11 px-4 text-sm min-h-[44px] min-w-[44px]' : 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base min-h-[48px] min-w-[48px]'
  }

  const variantClasses = {
    default: checked 
      ? 'kitchen-accent text-white border-transparent shadow-lg' 
      : 'kitchen-bg kitchen-border kitchen-text hover:kitchen-surface',
    outline: checked 
      ? 'kitchen-accent text-white border-kitchen-accent' 
      : 'kitchen-bg kitchen-border kitchen-text hover:kitchen-surface',
    ghost: checked 
      ? 'kitchen-accent/20 text-kitchen-accent hover:kitchen-accent/30' 
      : 'kitchen-bg kitchen-text hover:kitchen-surface'
  }

  return (
    <Button
      variant="outline"
      size={size === 'default' ? 'sm' : size}
      disabled={disabled}
      className={cn(
        'kitchen-toggle-button transition-all duration-200 relative overflow-hidden',
        'font-medium rounded-lg border-2',
        sizeClasses[size],
        variantClasses[variant],
        isPressed && 'scale-95',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      aria-pressed={checked ? 'true' : 'false'}
      role="switch"
    >
      {/* Ripple effect */}
      <span className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-20 transition-opacity duration-200" />
      
      {/* Content */}
      <span className="relative flex items-center justify-center gap-2">
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {showLabel && <span className="truncate">{children}</span>}
      </span>
    </Button>
  )
}

interface EnhancedToggleGroupProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  className?: string
  orientation?: 'horizontal' | 'vertical'
  size?: 'sm' | 'default' | 'lg'
  touchOptimized?: boolean
}

export function EnhancedToggleGroup({
  value,
  onValueChange,
  children,
  className = '',
  orientation = 'horizontal',
  size = 'default',
  touchOptimized = true
}: EnhancedToggleGroupProps) {
  const orientationClasses = {
    horizontal: 'flex-row',
    vertical: 'flex-col'
  }

  return (
    <div 
      className={cn(
        'kitchen-toggle-group flex gap-1 p-1 rounded-xl kitchen-bg kitchen-border',
        orientationClasses[orientation],
        className
      )}
      role="group"
    >
      <ToggleGroupContext.Provider value={{ value, onValueChange }}>
        {children}
      </ToggleGroupContext.Provider>
    </div>
  )
}

interface EnhancedToggleGroupItemProps {
  value: string
  children: React.ReactNode
  icon?: React.ReactNode
  disabled?: boolean
  className?: string
}

export function EnhancedToggleGroupItem({
  value: itemValue,
  children,
  icon,
  disabled = false,
  className = ''
}: EnhancedToggleGroupItemProps) {
  const groupValue = useToggleGroupValue()
  const onValueChange = useToggleGroupOnChange()

  const isChecked = groupValue === itemValue

  return (
    <EnhancedToggle
      checked={isChecked}
      onCheckedChange={() => onValueChange(itemValue)}
      variant="ghost"
      size="sm"
      disabled={disabled}
      className={cn(
        'flex-1 justify-start',
        className
      )}
      icon={icon}
      showLabel={true}
    >
      {children}
    </EnhancedToggle>
  )
}

// Context for toggle group
import { createContext, useContext } from 'react'

const ToggleGroupContext = createContext<{
  value: string
  onValueChange: (value: string) => void
} | null>(null)

function useToggleGroupValue() {
  const context = useContext(ToggleGroupContext)
  if (!context) throw new Error('ToggleGroupItem must be used within EnhancedToggleGroup')
  return context.value
}

function useToggleGroupOnChange() {
  const context = useContext(ToggleGroupContext)
  if (!context) throw new Error('ToggleGroupItem must be used within EnhancedToggleGroup')
  return context.onValueChange
}

// Enhanced Switch Component
interface EnhancedSwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
  label?: string
  description?: string
  size?: 'sm' | 'default' | 'lg'
  id?: string
}

export function EnhancedSwitch({
  checked,
  onCheckedChange,
  disabled = false,
  className = '',
  label,
  description,
  size = 'default',
  id
}: EnhancedSwitchProps) {
  const switchId = id || `switch-${Math.random().toString(36).substr(2, 9)}`
  
  const sizeClasses = {
    sm: 'h-5 w-9',
    default: 'h-6 w-11',
    lg: 'h-7 w-13'
  }

  const thumbSizeClasses = {
    sm: 'h-3 w-3',
    default: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  const thumbTranslate = {
    sm: 'translate-x-4',
    default: 'translate-x-5',
    lg: 'translate-x-6'
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <button
        type="button"
        role="switch"
        aria-checked={!!checked}
        aria-label={label}
        disabled={disabled}
        className={cn(
          'relative inline-flex flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-kitchen-accent focus:ring-offset-2',
          checked ? 'kitchen-accent' : 'kitchen-border',
          sizeClasses[size],
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onClick={() => onCheckedChange(!checked)}
        id={switchId}
      >
        <span
          className={cn(
            'pointer-events-none inline-block rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out',
            thumbSizeClasses[size],
            checked ? thumbTranslate[size] : 'translate-x-0'
          )}
        />
      </button>
      
      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <label 
              htmlFor={switchId}
              className="text-sm font-medium kitchen-text cursor-pointer"
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs kitchen-text-secondary">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
