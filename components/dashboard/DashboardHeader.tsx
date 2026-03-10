'use client'

import { useState } from 'react'
import { Calendar, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DashboardHeaderProps {
  title?: string
  subtitle?: string
  onTabChange?: (tab: string) => void
  onDateChange?: (date: string) => void
  onFilterClick?: () => void
  activeTab?: string
  selectedDate?: string
}

export function DashboardHeader({ 
  title = "My Dashboard", 
  subtitle = "Your recent transaction activity and all",
  onTabChange,
  onDateChange,
  onFilterClick,
  activeTab = 'items',
  selectedDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}: DashboardHeaderProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(activeTab)
  const [internalSelectedDate, setInternalSelectedDate] = useState(selectedDate)

  const handleTabChange = (tab: string) => {
    setInternalActiveTab(tab)
    onTabChange?.(tab)
  }

  const handleDateChange = (date: string) => {
    setInternalSelectedDate(date)
    onDateChange?.(date)
  }

  return (
    <div className="mb-8">
      {/* Header Title and Subtitle */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {subtitle}
        </p>
      </div>

      {/* Navigation Tabs and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => handleTabChange('items')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              internalActiveTab === 'items'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Items
          </button>
          <button
            onClick={() => handleTabChange('customer')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              internalActiveTab === 'customer'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Customer
          </button>
        </div>

        {/* Date Picker and Filter */}
        <div className="flex items-center space-x-3">
          {/* Date Picker */}
          <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
            <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {internalSelectedDate}
            </span>
          </div>

          {/* Filter Button */}
          <Button
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
            onClick={onFilterClick}
          >
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
