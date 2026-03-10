'use client'

import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Download, TrendingUp, FileSpreadsheet, FileText } from 'lucide-react'
import { useRestaurants } from '@/hooks/use-restaurants'
import { useToast } from '@/hooks/use-toast'
import { useCurrency } from '@/hooks/use-currency'

// Dynamic imports for lazy loading
const KPICards = lazy(() => import('./components/KPICards').then(module => ({ default: module.KPICards })))
const ProductStats = lazy(() => import('./components/ProductStats').then(module => ({ default: module.ProductStats })))
const CustomerHabits = lazy(() => import('./components/CustomerHabits').then(module => ({ default: module.CustomerHabits })))
const CustomerGrowth = lazy(() => import('./components/CustomerGrowth').then(module => ({ default: module.default })))

/**
 * Optimized Reports Page
 * Lightweight dashboard with lazy-loaded components
 * Better performance with strategic data fetching
 */
export default function OptimizedReportsPage() {
  const [dailyData, setDailyData] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [paymentData, setPaymentData] = useState<any[]>([])
  const [statusData, setStatusData] = useState<any[]>([])
  const [dateRange, setDateRange] = useState('week')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null)
  const [userRole, setUserRole] = useState('')
  
  const router = useRouter()
  const { toast } = useToast()
  const { restaurants, isLoading: restaurantsLoading } = useRestaurants()
  const { formatAmount, getCurrencySymbol, getCurrencyCode } = useCurrency({ restaurantId: selectedRestaurant || undefined })

  // Memoized processed data for performance
  const processedData = useMemo(() => {
    // Debug logging for data flow
    console.log('[Reports] Processing data:', {
      dailyDataLength: dailyData?.length || 0,
      dailyDataType: typeof dailyData,
      isArray: Array.isArray(dailyData),
      sampleDailyData: dailyData?.slice(0, 2)
    })

    if (!Array.isArray(dailyData) || dailyData.length === 0) {
      console.log('[Reports] No dailyData available, returning zeros')
      return {
        totalRevenue: 0,
        totalOrders: 0,
        totalTransactions: 0,
        averageTransaction: 0
      }
    }

    const totalRevenue = dailyData.reduce((sum, day) => {
      const sales = typeof day?.sales === 'number' && !isNaN(day.sales) ? day.sales : 0
      return sum + sales
    }, 0)
    
    const totalTransactions = dailyData.reduce((sum, day) => {
      const transactions = typeof day?.transactions === 'number' && !isNaN(day.transactions) ? day.transactions : 0
      return sum + transactions
    }, 0)
    
    const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0
    const totalOrders = totalTransactions // Simplified for demo

    // Debug logging for currency issues
    console.log('[Reports] Processed Data:', {
      totalRevenue,
      totalOrders,
      totalTransactions,
      averageTransaction,
      currencyCode: getCurrencyCode(),
      sampleDailyData: dailyData.slice(0, 2)
    })

    return {
      totalRevenue,
      totalOrders,
      totalTransactions,
      averageTransaction
    }
  }, [dailyData, getCurrencyCode])

  const { totalRevenue, totalOrders, totalTransactions, averageTransaction } = processedData

  // Check user role on mount
  useEffect(() => {
    const role = localStorage.getItem('userRole')
    setUserRole(role || '')

    if (role !== 'manager' && role !== 'admin') {
      toast({
        title: 'Access Denied',
        description: 'Only managers and administrators can access reports.',
        variant: 'destructive'
      })
      router.push('/dashboard')
      return
    }
  }, [router, toast])
  
  // Set default restaurant when data loads
  useEffect(() => {
    if (restaurants.length > 0 && !selectedRestaurant) {
      setSelectedRestaurant(restaurants[0].id)
    }
  }, [restaurants, selectedRestaurant])

  // Optimized data loading with caching
  useEffect(() => {
    if (selectedRestaurant) {
      loadReportData()
    }
  }, [selectedRestaurant, dateRange, startDate, endDate])

  const loadReportData = async () => {
    try {
      setIsLoading(true)
      
      // Build date range parameters
      let dateParams = ''
      if (dateRange === 'custom' && startDate && endDate) {
        dateParams = `&startDate=${startDate}&endDate=${endDate}`
      } else if (dateRange !== 'custom') {
        dateParams = `&range=${dateRange}`
      }
      
      // Fetch analytics data with caching headers
      const response = await fetch(`/api/analytics?restaurantId=${selectedRestaurant}${dateParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Cache-Control': 'max-age=300' // 5 minute cache
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch analytics data')
      }

      const analyticsData = await response.json()
      
      setDailyData(analyticsData.dailyData || [])
      setCategoryData(analyticsData.categoryData || [])
      setPaymentData(analyticsData.paymentData || [])
      setStatusData(analyticsData.statusData || [])
    } catch (error) {
      console.error('[Reports] Error loading data:', error)
      // Set empty data on error
      setDailyData([])
      setCategoryData([])
      setPaymentData([])
      setStatusData([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = (format: 'excel' | 'pdf') => {
    const data = {
      summary: processedData,
      dailyData,
      categoryData,
      dateRange,
      restaurant: restaurants.find((r: any) => r.id === selectedRestaurant)?.name || 'Unknown'
    }
    
    const filename = `reports-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'pdf'}`
    
    if (format === 'excel') {
      // Simple Excel export
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    } else {
      // Simple PDF export (window.print for now)
      window.print()
    }
    
    toast({
      title: 'Export Successful',
      description: `${format === 'excel' ? 'Excel' : 'PDF'} report has been downloaded`
    })
  }

  // Early return for loading states
  if (isLoading && !dailyData.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading reports...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!userRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking permissions...</p>
          </div>
        </div>
      </div>
    )
  }

  if (userRole !== 'manager' && userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="flex items-center justify-center min-h-screen p-8">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="text-center p-8">
              <p className="text-gray-600">You don't have permission to access this page.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header Section - Optimized */}
      <div className="relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-b border-slate-200/60 dark:border-slate-700/60">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-indigo-500/5"></div>
        <div className="relative px-4 py-6 lg:px-6 lg:py-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 lg:p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <TrendingUp className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                    Sales Report
                  </h1>
                  <p className="text-sm lg:text-base text-slate-600 dark:text-slate-400">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => handleExport('excel')}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-sm lg:text-base"
                size="sm"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Excel</span>
              </Button>
              <Button 
                onClick={() => handleExport('pdf')}
                className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-sm lg:text-base"
                size="sm"
              >
                <FileText className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">PDF</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
        {/* Controls Section - Optimized */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 shadow-lg">
            <CardHeader className="pb-3 lg:pb-4">
              <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                Restaurant
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedRestaurant || ''} onValueChange={setSelectedRestaurant} disabled={restaurantsLoading}>
                <SelectTrigger className="bg-white/50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600">
                  <SelectValue placeholder="Select restaurant" />
                </SelectTrigger>
                <SelectContent>
                  {restaurants.map((restaurant: any) => (
                    <SelectItem key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 shadow-lg">
            <CardHeader className="pb-3 lg:pb-4">
              <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                  <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                Date Range
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="lg:col-span-1">
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="bg-white/50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 mt-1">
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="quarter">This Quarter</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {dateRange === 'custom' && (
                  <>
                    <div>
                      <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Start Date
                      </label>
                      <input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        placeholder="Select start date"
                        className="w-full p-2 border rounded bg-white/50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 mt-1"
                      />
                    </div>
                    <div>
                      <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        End Date
                      </label>
                      <input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        placeholder="Select end date"
                        className="w-full p-2 border rounded bg-white/50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 mt-1"
                      />
                    </div>
                  </>
                )}
                <div className="flex items-end lg:col-span-1">
                  <Button 
                    onClick={loadReportData} 
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Layout - Matches Image Design */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - KPI Cards */}
          <div className="lg:col-span-2 space-y-6">
            <Suspense fallback={<div className="animate-pulse h-32 bg-gray-200 rounded-lg"></div>}>
              <KPICards
                totalRevenue={totalRevenue}
                totalOrders={totalOrders}
                totalTransactions={totalTransactions}
                averageTransaction={averageTransaction}
                formatAmount={formatAmount}
                isLoading={isLoading}
              />
            </Suspense>

            {/* Customer Habits Chart */}
            <Suspense fallback={<div className="animate-pulse h-96 bg-gray-200 rounded-lg"></div>}>
              <CustomerHabits
                dailyData={dailyData}
                isLoading={isLoading}
              />
            </Suspense>
          </div>

          {/* Right Column - Product Stats & Customer Growth */}
          <div className="space-y-6">
            <Suspense fallback={<div className="animate-pulse h-64 bg-gray-200 rounded-lg"></div>}>
              <ProductStats
                categoryData={categoryData}
                isLoading={isLoading}
              />
            </Suspense>

            <Suspense fallback={<div className="animate-pulse h-64 bg-gray-200 rounded-lg"></div>}>
              <CustomerGrowth
                paymentData={paymentData}
                statusData={statusData}
                isLoading={isLoading}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
