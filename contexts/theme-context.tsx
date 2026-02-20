'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'kitchen-light' | 'kitchen-dark'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('kitchen-light')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('kitchen-theme') as Theme
      if (savedTheme) {
        setThemeState(savedTheme)
        applyTheme(savedTheme)
      }
    }
  }, [])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    if (typeof window !== 'undefined') {
      localStorage.setItem('kitchen-theme', newTheme)
    }
    applyTheme(newTheme)
  }

  const toggleTheme = () => {
    const themes: Theme[] = ['kitchen-light', 'kitchen-dark', 'light', 'dark']
    const currentIndex = themes.indexOf(theme)
    const nextTheme = themes[(currentIndex + 1) % themes.length]
    setTheme(nextTheme)
  }

  const applyTheme = (theme: Theme) => {
    if (typeof window === 'undefined') return
    
    const root = document.documentElement
    
    // Remove all theme classes
    root.classList.remove('light', 'dark', 'kitchen-light', 'kitchen-dark')
    
    // Apply new theme
    root.classList.add(theme)
    
    // Apply kitchen-specific optimizations
    if (theme.includes('kitchen')) {
      root.classList.add('kitchen-mode')
    } else {
      root.classList.remove('kitchen-mode')
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
