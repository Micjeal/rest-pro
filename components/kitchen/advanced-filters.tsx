'use client'

import { useState, useMemo } from 'react'
import { Search, Filter, Calendar, User, Clock, Star, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { format } from 'date-fns'
import type { KitchenOrder } from '@/hooks/use-kitchen-orders'

interface AdvancedFiltersProps {
  orders: KitchenOrder[]
  onFiltersChange: (filteredOrders: KitchenOrder[]) => void
}

export function AdvancedFilters({ orders, onFiltersChange }: AdvancedFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilters, setStatusFilters] = useState<string[]>([])
  const [priorityFilters, setPriorityFilters] = useState<string[]>([])
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'custom'>('today')
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>()
  const [customerFilter, setCustomerFilter] = useState('')
  const [complexityFilter, setComplexityFilter] = useState<'all' | 'simple' | 'medium' | 'complex'>('all')

  const statusOptions = ['pending', 'preparing', 'ready', 'completed', 'cancelled']
  const priorityOptions = ['low', 'normal', 'high', 'urgent', 'vip']

  const filteredOrders = useMemo(() => {
    let filtered = orders

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items?.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Status filter
    if (statusFilters.length > 0) {
      filtered = filtered.filter(order => 
        statusFilters.includes(order.status || 'pending')
      )
    }

    // Priority filter
    if (priorityFilters.length > 0) {
      filtered = filtered.filter(order => 
        priorityFilters.includes(order.priority || 'normal')
      )
    }

    // Customer filter
    if (customerFilter) {
      filtered = filtered.filter(order => 
        order.customer_name?.toLowerCase().includes(customerFilter.toLowerCase())
      )
    }

    // Time range filter
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    if (timeRange === 'today') {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.created_at || '')
        return orderDate >= today
      })
    } else if (timeRange === 'week') {
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.created_at || '')
        return orderDate >= weekAgo
      })
    } else if (timeRange === 'month') {
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.created_at || '')
        return orderDate >= monthAgo
      })
    } else if (timeRange === 'custom' && dateRange?.from) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.created_at || '')
        const from = dateRange.from!
        const to = dateRange.to || new Date()
        return orderDate >= from && orderDate <= to
      })
    }

    // Complexity filter
    if (complexityFilter !== 'all') {
      filtered = filtered.filter(order => {
        const itemCount = order.items?.length || 0
        if (complexityFilter === 'simple') return itemCount <= 2
        if (complexityFilter === 'medium') return itemCount > 2 && itemCount <= 5
        if (complexityFilter === 'complex') return itemCount > 5
        return true
      })
    }

    return filtered
  }, [orders, searchTerm, statusFilters, priorityFilters, customerFilter, timeRange, dateRange, complexityFilter])

  useMemo(() => {
    onFiltersChange(filteredOrders)
  }, [filteredOrders, onFiltersChange])

  const clearAllFilters = () => {
    setSearchTerm('')
    setStatusFilters([])
    setPriorityFilters([])
    setTimeRange('today')
    setDateRange(undefined)
    setCustomerFilter('')
    setComplexityFilter('all')
  }

  const activeFiltersCount = [
    searchTerm,
    statusFilters.length,
    priorityFilters.length,
    customerFilter,
    timeRange !== 'today',
    complexityFilter !== 'all'
  ].filter(Boolean).length

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Advanced Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} active
              </Badge>
            )}
          </CardTitle>
          {activeFiltersCount > 0 && (
            <Button variant="outline" size="sm" onClick={clearAllFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by order number, customer, or items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Status</Label>
            <div className="space-y-1">
              {statusOptions.map(status => (
                <div key={status} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${status}`}
                    checked={statusFilters.includes(status)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setStatusFilters([...statusFilters, status])
                      } else {
                        setStatusFilters(statusFilters.filter(s => s !== status))
                      }
                    }}
                  />
                  <Label htmlFor={`status-${status}`} className="text-sm capitalize">
                    {status}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Priority Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Priority</Label>
            <div className="space-y-1">
              {priorityOptions.map(priority => (
                <div key={priority} className="flex items-center space-x-2">
                  <Checkbox
                    id={`priority-${priority}`}
                    checked={priorityFilters.includes(priority)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setPriorityFilters([...priorityFilters, priority])
                      } else {
                        setPriorityFilters(priorityFilters.filter(p => p !== priority))
                      }
                    }}
                  />
                  <Label htmlFor={`priority-${priority}`} className="text-sm capitalize flex items-center gap-1">
                    {priority === 'vip' && <Star className="h-3 w-3 text-yellow-500" />}
                    {priority}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Time Range Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Time Range</Label>
            <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
            
            {timeRange === 'custom' && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    <Calendar className="h-4 w-4 mr-2" />
                    {dateRange?.from ? format(dateRange.from, 'MMM dd') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={dateRange?.from}
                    onSelect={(date) => setDateRange({ from: date, to: date })}
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>

          {/* Complexity Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Order Complexity</Label>
            <Select value={complexityFilter} onValueChange={(value: any) => setComplexityFilter(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="simple">Simple (1-2 items)</SelectItem>
                <SelectItem value="medium">Medium (3-5 items)</SelectItem>
                <SelectItem value="complex">Complex (6+ items)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Customer Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Customer Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Filter by customer name..."
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
