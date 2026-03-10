'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Filter } from 'lucide-react'

interface FilterModalProps {
  isOpen: boolean
  onClose: () => void
  onApplyFilter: (filters: FilterOptions) => void
}

interface FilterOptions {
  status?: string[]
  dateRange?: {
    start: string
    end: string
  }
  minAmount?: number
  maxAmount?: number
}

export function FilterModal({ isOpen, onClose, onApplyFilter }: FilterModalProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    status: [],
    dateRange: {
      start: '',
      end: ''
    },
    minAmount: 0,
    maxAmount: 10000
  })

  const statusOptions = [
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'cancelled', label: 'Cancelled' }
  ]

  const handleStatusToggle = (status: string) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status?.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...(prev.status || []), status]
    }))
  }

  const handleApply = () => {
    onApplyFilter(filters)
    onClose()
  }

  const handleReset = () => {
    setFilters({
      status: [],
      dateRange: { start: '', end: '' },
      minAmount: 0,
      maxAmount: 10000
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filter Orders</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <div className="space-y-2">
              {statusOptions.map((option) => (
                <label key={option.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.status?.includes(option.value) || false}
                    onChange={() => handleStatusToggle(option.value)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={filters.dateRange?.start || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  dateRange: { ...prev.dateRange!, start: e.target.value }
                }))}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Start date"
              />
              <input
                type="date"
                value={filters.dateRange?.end || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  dateRange: { ...prev.dateRange!, end: e.target.value }
                }))}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="End date"
              />
            </div>
          </div>

          {/* Amount Range */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={filters.minAmount}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  minAmount: parseFloat(e.target.value) || 0
                }))}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Min amount"
              />
              <input
                type="number"
                value={filters.maxAmount}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  maxAmount: parseFloat(e.target.value) || 0
                }))}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Max amount"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button onClick={handleApply}>
              Apply Filter
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
