'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'

// Error Boundary Component
class ChartErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[Reports] Chart error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-500">Chart data temporarily unavailable</p>
            <p className="text-sm text-gray-400 mt-2">Please try refreshing the page</p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, ComposedChart } from 'recharts'
import { Calendar, Download, TrendingUp, Shield, Filter, FileSpreadsheet, FileText, ChevronDown, Check, X } from 'lucide-react'
import { useRestaurants } from '@/hooks/use-restaurants'
import { useToast } from '@/hooks/use-toast'
import { useCurrency } from '@/hooks/use-currency'
import { ReportExporter } from '@/lib/export-utils'

/**
 * Reports Page
 * Route: /reports
 * Displays sales analytics and reports
 * Manager & Admin only access
 */
export default function ReportsPage() {
  const [dailyData, setDailyData] = useState<any[]>([])
  const [hourlyData, setHourlyData] = useState<any[]>([])
  const [weeklyData, setWeeklyData] = useState<any[]>([])
  const [paymentData, setPaymentData] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [statusData, setStatusData] = useState<any[]>([])
  const [dateRange, setDateRange] = useState('week')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string>('')
  
  // Enhanced filters
  const [showFilters, setShowFilters] = useState(false)
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>([])
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [chartType, setChartType] = useState<'line' | 'bar' | 'composed'>('composed')
  const [isExporting, setIsExporting] = useState(false)
  const [comparisonMode, setComparisonMode] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  
  // Staff and financial data states
  const [staffData, setStaffData] = useState<any>(null)
  const [financialData, setFinancialData] = useState<any>(null)
  const [staffLoading, setStaffLoading] = useState(false)
  const [financialLoading, setFinancialLoading] = useState(false)
  
  const router = useRouter()
  const { toast } = useToast()
  
  // Use real data from hooks
  const { restaurants, isLoading: restaurantsLoading } = useRestaurants()
  const { formatAmount, getCurrencySymbol } = useCurrency({ restaurantId: selectedRestaurant || undefined })

  // Safe data processing with comprehensive validation - MOVED HERE TO FIX HOOKS ORDER
  const processedData = useMemo(() => {
    try {
      // Validate and sanitize data arrays
      const safeDailyData = Array.isArray(dailyData) ? dailyData.filter(day => day && typeof day === 'object') : []
      const safeStatusData = Array.isArray(statusData) ? statusData.filter(status => status && typeof status === 'object') : []
      
      // Calculate metrics with safe reduce operations
      const totalRevenue = safeDailyData.reduce((sum, day) => {
        const sales = typeof day?.sales === 'number' && !isNaN(day.sales) ? day.sales : 0
        return sum + sales
      }, 0)
      
      const totalTransactions = safeDailyData.reduce((sum, day) => {
        const transactions = typeof day?.transactions === 'number' && !isNaN(day.transactions) ? day.transactions : 0
        return sum + transactions
      }, 0)
      
      const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0
      
      // Calculate sold and cleared orders from status data
      const soldOrders = safeStatusData.find(s => s?.status === 'Completed')?.count || 0
      const clearedOrders = safeStatusData.reduce((sum, s) => {
        const count = typeof s?.count === 'number' && !isNaN(s.count) ? s.count : 0
        return sum + count
      }, 0)
      
      // Calculate revenue metrics from API data
      const soldRevenue = safeStatusData.find(s => s?.status === 'Completed')?.revenue || 0
      const totalOrderRevenue = safeStatusData.reduce((sum, s) => {
        const revenue = typeof s?.revenue === 'number' && !isNaN(s.revenue) ? s.revenue : 0
        return sum + revenue
      }, 0)
      
      const averageOrderValue = totalOrderRevenue > 0 && clearedOrders > 0 ? (totalOrderRevenue / clearedOrders).toFixed(2) : '0.00'
      
      return {
        totalRevenue,
        totalTransactions,
        averageTransaction,
        soldOrders,
        clearedOrders,
        soldRevenue,
        totalOrderRevenue,
        averageOrderValue
      }
    } catch (error) {
      console.error('[Reports] Error processing data:', error)
      // Return safe defaults if processing fails
      return {
        totalRevenue: 0,
        totalTransactions: 0,
        averageTransaction: 0,
        soldOrders: 0,
        clearedOrders: 0,
        soldRevenue: 0,
        totalOrderRevenue: 0,
        averageOrderValue: '0.00'
      }
    }
  }, [dailyData, statusData])

  const { totalRevenue, totalTransactions, averageTransaction, soldOrders, clearedOrders, soldRevenue, totalOrderRevenue, averageOrderValue } = processedData

  // Check user role on mount
  useEffect(() => {
    const role = localStorage.getItem('userRole')
    setUserRole(role || '')

    // Redirect non-managers and non-admins
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

  useEffect(() => {
    console.log('[Reports] Page loaded')
    if (selectedRestaurant) {
      loadReportData()
    }
  }, [selectedRestaurant, dateRange, startDate, endDate])

  // Load staff and financial data when tabs are accessed
  useEffect(() => {
    if (activeTab === 'staff' && selectedRestaurant) {
      loadStaffData()
    }
  }, [activeTab, selectedRestaurant, dateRange, startDate, endDate])

  useEffect(() => {
    if (activeTab === 'tax-profit' && selectedRestaurant) {
      loadFinancialData()
    }
  }, [activeTab, selectedRestaurant, dateRange, startDate, endDate])

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
      
      // Fetch real analytics data from API
      const response = await fetch(`/api/analytics?restaurantId=${selectedRestaurant}${dateParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch analytics data')
      }

      const analyticsData = await response.json()
      
      setDailyData(analyticsData.dailyData || [])
      setHourlyData(analyticsData.hourlyData || [])
      setWeeklyData(analyticsData.weeklyData || [])
      setPaymentData(analyticsData.paymentData || [])
      setCategoryData(analyticsData.categoryData || [])
      setStatusData(analyticsData.statusData || [])
      console.log('[Reports] Enhanced data loaded')
    } catch (error) {
      console.error('[Reports] Error loading data:', error)
      // Fallback to empty data if API fails
      setDailyData([])
      setHourlyData([])
      setWeeklyData([])
      setPaymentData([])
      setCategoryData([])
      setStatusData([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportReport = async () => {
    try {
      const reportData = {
        summary: {
          totalRevenue,
          totalTransactions,
          averageTransaction,
          dateRange: dateRange,
          restaurant: restaurants.find((r: any) => r.id === selectedRestaurant)?.name || 'Unknown'
        },
        analytics: {
          dailyData,
          hourlyData,
          weeklyData,
          paymentData,
          categoryData,
          statusData
        },
        insights: {
          bestDay: (dailyData || []).length > 0 ? (dailyData || []).reduce((max, day) => {
            if (!day || typeof day?.sales !== 'number' || isNaN(day.sales)) return max
            return (day.sales > (max?.sales || 0)) ? day : max
          }, { sales: 0 }) : null,
          worstDay: (dailyData || []).length > 0 ? (dailyData || []).reduce((min, day) => {
            if (!day || typeof day?.sales !== 'number' || isNaN(day.sales)) return min
            return (day.sales < (min?.sales || Infinity)) ? day : min
          }, { sales: Infinity }) : null,
          peakHour: (hourlyData || []).length > 0 ? (hourlyData || []).reduce((max, hour) => {
            if (!hour || typeof hour?.sales !== 'number' || isNaN(hour.sales)) return max
            return (hour.sales > (max?.sales || 0)) ? hour : max
          }, { sales: 0 }) : null,
          topCategory: (categoryData || []).length > 0 ? (categoryData || []).reduce((max, cat) => {
            if (!cat || typeof cat?.value !== 'number' || isNaN(cat.value)) return max
            return (cat.value > (max?.value || 0)) ? cat : max
          }, { value: 0 }) : null,
          topPaymentMethod: (paymentData || []).length > 0 ? (paymentData || []).reduce((max, pay) => {
            if (!pay || typeof pay?.value !== 'number' || isNaN(pay.value)) return max
            return (pay.value > (max?.value || 0)) ? pay : max
          }, { value: 0 }) : null
        }
      }
      
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `enhanced-reports-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export report data',
        variant: 'destructive'
      })
    }
  }

  const loadStaffData = async () => {
    if (!selectedRestaurant) return
    
    try {
      setStaffLoading(true)
      
      // Build date range parameters
      let dateParams = ''
      if (dateRange === 'custom' && startDate && endDate) {
        dateParams = `&startDate=${startDate}&endDate=${endDate}`
      } else if (dateRange !== 'custom') {
        dateParams = `&range=${dateRange}`
      }
      
      console.log('[Reports] Loading staff data with params:', {
        restaurantId: selectedRestaurant,
        dateRange,
        dateParams,
        startDate,
        endDate
      })
      
      // Fetch staff performance data
      const response = await fetch(`/api/staff-performance?restaurantId=${selectedRestaurant}${dateParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      console.log('[Reports] Staff API response status:', response.status)
      console.log('[Reports] Staff API response ok:', response.ok)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[Reports] Staff API error response:', errorText)
        console.log('[Reports] Using fallback staff data due to API error')
        // Use fallback data instead of throwing error
        setStaffData(getFallbackStaffData())
        return
      }

      const staffPerformanceData = await response.json()
      console.log('[Reports] Staff data loaded successfully:', staffPerformanceData)
      setStaffData(staffPerformanceData)
    } catch (error) {
      console.error('[Reports] Error loading staff data:', error)
      setStaffData(getFallbackStaffData())
    } finally {
      setStaffLoading(false)
    }
  }

  const getFallbackStaffData = () => {
    return {
      staffPerformance: [
        {
          staffId: 'sample-1',
          name: 'Sample Staff 1',
          email: 'staff1@example.com',
          role: 'cashier',
          totalOrders: 25,
          totalRevenue: 125000,
          totalPreparationTime: 300,
          averagePreparationTime: 12,
          efficiencyScore: 85,
          daysWorked: 5,
          ordersCompleted: 25,
          ordersCancelled: 0,
          averageOrderValue: 5000,
          totalHoursWorked: 40,
          performanceData: []
        },
        {
          staffId: 'sample-2',
          name: 'Sample Staff 2',
          email: 'staff2@example.com',
          role: 'chef',
          totalOrders: 30,
          totalRevenue: 150000,
          totalPreparationTime: 360,
          averagePreparationTime: 12,
          efficiencyScore: 90,
          daysWorked: 5,
          ordersCompleted: 30,
          ordersCancelled: 0,
          averageOrderValue: 5000,
          totalHoursWorked: 40,
          performanceData: []
        }
      ],
      shiftAssignments: [
        {
          staffId: 'sample-1',
          name: 'Sample Staff 1',
          totalShifts: 5,
          completedShifts: 5,
          scheduledShifts: 0,
          cancelledShifts: 0,
          shiftData: []
        }
      ],
      userActivity: [
        { type: 'order_created', count: 55 },
        { type: 'order_completed', count: 55 },
        { type: 'login', count: 10 }
      ],
      summary: {
        totalStaff: 2,
        activeStaff: 2,
        totalOrders: 55,
        totalRevenue: 275000,
        averageEfficiency: 87.5,
        totalShifts: 5,
        completedShifts: 5
      }
    }
  }

  const loadFinancialData = async () => {
    if (!selectedRestaurant) return
    
    try {
      setFinancialLoading(true)
      
      // Build date range parameters
      let dateParams = ''
      if (dateRange === 'custom' && startDate && endDate) {
        dateParams = `&startDate=${startDate}&endDate=${endDate}`
      } else if (dateRange !== 'custom') {
        dateParams = `&range=${dateRange}`
      }
      
      console.log('[Reports] Loading financial data with params:', {
        restaurantId: selectedRestaurant,
        dateRange,
        dateParams,
        startDate,
        endDate
      })
      
      // Fetch financial tracking data
      const response = await fetch(`/api/financial-tracking?restaurantId=${selectedRestaurant}${dateParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      console.log('[Reports] Financial API response status:', response.status)
      console.log('[Reports] Financial API response ok:', response.ok)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[Reports] Financial API error response:', errorText)
        console.log('[Reports] Using fallback financial data due to API error')
        // Use fallback data instead of throwing error
        setFinancialData(getFallbackFinancialData())
        return
      }

      const financialTrackingData = await response.json()
      console.log('[Reports] Financial data loaded successfully:', financialTrackingData)
      setFinancialData(financialTrackingData)
    } catch (error) {
      console.error('[Reports] Error loading financial data:', error)
      setFinancialData(getFallbackFinancialData())
    } finally {
      setFinancialLoading(false)
    }
  }

  const getFallbackFinancialData = () => {
    return {
      summary: {
        totalRevenue: 500000,
        totalCost: 300000,
        grossProfit: 200000,
        netProfit: 160000,
        totalTax: 40000,
        profitMargin: 40,
        totalOrders: 100,
        averageOrderValue: 5000
      },
      dailyData: [
        {
          date: new Date().toISOString().split('T')[0],
          totalRevenue: 100000,
          totalCost: 60000,
          grossProfit: 40000,
          netProfit: 32000,
          taxCollected: 8000,
          profitMargin: 40,
          orderCount: 20,
          customerCount: 20,
          profitChange: 0,
          profitChangePercent: 0
        },
        {
          date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          totalRevenue: 80000,
          totalCost: 48000,
          grossProfit: 32000,
          netProfit: 25600,
          taxCollected: 6400,
          profitMargin: 40,
          orderCount: 16,
          customerCount: 16,
          profitChange: 0,
          profitChangePercent: 0
        }
      ],
      categoryProfit: [
        {
          category: 'standard',
          revenue: 300000,
          cost: 180000,
          profit: 120000,
          tax: 24000,
          itemCount: 60,
          profitMargin: 40
        },
        {
          category: 'premium',
          revenue: 200000,
          cost: 120000,
          profit: 80000,
          tax: 16000,
          itemCount: 40,
          profitMargin: 40
        }
      ],
      taxBreakdown: [
        {
          type: 'Standard Tax (18%)',
          amount: 32000,
          percentage: 80
        },
        {
          type: 'Other Taxes',
          amount: 8000,
          percentage: 20
        }
      ],
      menuItems: [],
      trends: {
        revenueGrowth: 25,
        profitGrowth: 25,
        averageDailyProfit: 40000
      }
    }
  }

  const handlePDFExport = async () => {
    try {
      setIsExporting(true)
      
      const filename = `restaurant-reports-${new Date().toISOString().split('T')[0]}.pdf`
      const success = await ReportExporter.exportToPDF('reports-content', filename)
      
      if (success) {
        toast({
          title: 'Export Successful',
          description: 'PDF report has been downloaded',
        })
      } else {
        throw new Error('PDF export failed')
      }
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export PDF report',
        variant: 'destructive'
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handlePrint = () => {

    window.print()
  }

  const handleExcelExport = async () => {
    try {
      setIsExporting(true)
      
      const exportData = ReportExporter.prepareExportData(
        dailyData,
        statusData,
        categoryData,
        paymentData,
        {
          totalRevenue,
          totalTransactions,
          averageTransaction,
          dateRange: dateRange,
          restaurant: restaurants.find((r: any) => r.id === selectedRestaurant)?.name || 'Unknown'
        },
        getCurrencySymbol()
      )
      
      const filename = `restaurant-reports-${new Date().toISOString().split('T')[0]}.xlsx`
      const success = await ReportExporter.exportToExcel(exportData, filename)
      
      if (success) {
        toast({
          title: 'Export Successful',
          description: 'Excel report has been downloaded',
        })
      } else {
        throw new Error('Excel export failed')
      }
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export Excel report',
        variant: 'destructive'
      })
    } finally {
      setIsExporting(false)
    }
  }

  // Early return if data is not ready to prevent processing errors
  if (!dailyData || !Array.isArray(dailyData) || isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading reports data...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show loading or access denied state while checking role
  if (!userRole) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-64">
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
      <div className="container mx-auto py-8">
        <Alert className="max-w-2xl mx-auto">
          <Shield className="h-4 w-4" />
          <AlertDescription className="text-center">
            You don't have permission to access this page. Reports are only available to managers and administrators.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
{/* Header Section - Mobile Optimized */}
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
                    Reports & Analytics
                  </h1>
                  <p className="text-sm lg:text-base text-slate-600 dark:text-slate-400">Sales trends and performance metrics</p>
                </div>
              </div>
            </div>
<Button 
              onClick={handleExportReport}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 btn-press text-sm lg:text-base"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Export Report</span>
              <span className="sm:hidden">Export</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      {/* Controls Section - Mobile Optimized */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Restaurant Selector */}
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 card-hover shadow-lg">
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

        {/* Date Range Selector */}
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 card-hover shadow-lg">
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
                <Label htmlFor="dateRange" className="text-sm font-medium text-slate-700 dark:text-slate-300">Range</Label>
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
                    <Label htmlFor="startDate" className="text-sm font-medium text-slate-700 dark:text-slate-300">Start</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-white/50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate" className="text-sm font-medium text-slate-700 dark:text-slate-300">End</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-white/50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 mt-1"
                    />
                  </div>
                </>
              )}
              <div className="flex items-end">
                <Button 
                  onClick={loadReportData} 
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 btn-press"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

<<<<<<< HEAD
      {/* Enhanced Filters Panel */}
      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 card-hover shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Filter className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              Advanced Filters
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200"
            >
              {showFilters ? <X className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CardTitle>
        </CardHeader>
        {showFilters && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Order Status Filter */}
              <div>
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Order Status</Label>
                <div className="space-y-2 mt-1">
                  {['Pending', 'Completed', 'Cancelled', 'Preparing'].map((status) => (
                    <div key={status} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`status-filter-${status.toLowerCase()}`}
                        checked={selectedStatuses.includes(status)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStatuses([...selectedStatuses, status])
                          } else {
                            setSelectedStatuses(selectedStatuses.filter(s => s !== status))
                          }
                        }}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        aria-label={`Filter by ${status} status`}
                      />
                      <Label htmlFor={`status-filter-${status.toLowerCase()}`} className="text-sm text-slate-600 dark:text-slate-400">
                        {status}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Method Filter */}
              <div>
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Payment Methods</Label>
                <div className="space-y-2 mt-1">
                  {['Cash', 'Card', 'Mobile Money', 'Bank Transfer'].map((method) => (
                    <div key={method} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`payment-filter-${method.toLowerCase().replace(' ', '-')}`}
                        checked={selectedPaymentMethods.includes(method)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPaymentMethods([...selectedPaymentMethods, method])
                          } else {
                            setSelectedPaymentMethods(selectedPaymentMethods.filter(m => m !== method))
                          }
                        }}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        aria-label={`Filter by ${method} payment method`}
                      />
                      <Label htmlFor={`payment-filter-${method.toLowerCase().replace(' ', '-')}`} className="text-sm text-slate-600 dark:text-slate-400">
                        {method}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amount Range Filter */}
              <div>
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Amount Range</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div>
                    <Label htmlFor="minAmount" className="text-xs text-slate-600 dark:text-slate-400">Min Amount</Label>
                    <Input
                      id="minAmount"
                      type="number"
                      placeholder="0"
                      value={minAmount}
                      onChange={(e) => setMinAmount(e.target.value)}
                      className="bg-white/50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600"
                    />
=======
      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">Overview</TabsTrigger>
          <TabsTrigger value="sales" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">Sales</TabsTrigger>
          <TabsTrigger value="items" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">Items</TabsTrigger>
          <TabsTrigger value="staff" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">Staff</TabsTrigger>
          <TabsTrigger value="tax-profit" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">Tax & Profit</TabsTrigger>
        </TabsList>

      {/* Overview Tab Content */}
        <TabsContent value="overview" className="space-y-6">
          {/* Simplified Summary Stats - 4 Essential Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-200/50 dark:border-emerald-800/30 card-hover shadow-lg hover:shadow-emerald-500/20 transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  <div className="p-1.5 bg-emerald-500/20 rounded-lg animate-pulse">
                    <TrendingUp className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
>>>>>>> 5f411463074bad6df11ba165bf5c738866c9c6f9
                  </div>
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">{formatAmount(totalRevenue)}</p>
                <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-1">Completed sales</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200/50 dark:border-blue-800/30 card-hover shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300">
                  <div className="p-1.5 bg-blue-500/20 rounded-lg animate-pulse">
                    <Calendar className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{totalTransactions}</p>
                <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">Completed orders</p>
              </CardContent>
            </Card>

<<<<<<< HEAD
            {/* Filter Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {selectedStatuses.length + selectedCategories.length + selectedPaymentMethods.length > 0 && 
                  `${selectedStatuses.length + selectedCategories.length + selectedPaymentMethods.length} filters applied`
                }
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedStatuses([])
                    setSelectedCategories([])
                    setSelectedPaymentMethods([])
                    setMinAmount('')
                    setMaxAmount('')
                  }}
                >
                  Clear All
                </Button>
                <Button
                  size="sm"
                  onClick={loadReportData}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-200/50 dark:border-emerald-800/30 card-hover shadow-lg hover:shadow-emerald-500/20 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
              <div className="p-1.5 bg-emerald-500/20 rounded-lg animate-pulse">
                <TrendingUp className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              </div>
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">{formatAmount(totalRevenue)}</p>
            <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-1">Completed sales</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200/50 dark:border-blue-800/30 card-hover shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300">
              <div className="p-1.5 bg-blue-500/20 rounded-lg animate-pulse">
                <Calendar className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              </div>
              Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{totalTransactions}</p>
            <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">Completed orders</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-200/50 dark:border-green-800/30 card-hover shadow-lg hover:shadow-green-500/20 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-300">
              <div className="p-1.5 bg-green-500/20 rounded-lg animate-pulse">
                <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
              </div>
              Sold Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-700 dark:text-green-300">{formatAmount(soldRevenue)}</p>
            <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-1">Completed orders</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-200/50 dark:border-orange-800/30 card-hover shadow-lg hover:shadow-orange-500/20 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-orange-700 dark:text-orange-300">
              <div className="p-1.5 bg-orange-500/20 rounded-lg animate-pulse">
                <Calendar className="h-3 w-3 text-orange-600 dark:text-orange-400" />
              </div>
              Cleared Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">{clearedOrders}</p>
            <p className="text-xs text-orange-600/70 dark:text-orange-400/70 mt-1">All orders</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200/50 dark:border-purple-800/30 card-hover shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-purple-700 dark:text-purple-300">
              <div className="p-1.5 bg-purple-500/20 rounded-lg animate-pulse">
                <TrendingUp className="h-3 w-3 text-purple-600 dark:text-purple-400" />
              </div>
              Avg Order Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">${averageOrderValue}</p>
            <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">Per order</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-500/10 to-pink-600/5 border-pink-200/50 dark:border-pink-800/30 card-hover shadow-lg hover:shadow-pink-500/20 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-pink-700 dark:text-pink-300">
              <div className="p-1.5 bg-pink-500/20 rounded-lg animate-pulse">
                <TrendingUp className="h-3 w-3 text-pink-600 dark:text-pink-400" />
              </div>
              Total Order Rev
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-pink-700 dark:text-pink-300">{formatAmount(totalOrderRevenue)}</p>
            <p className="text-xs text-pink-600/70 dark:text-pink-400/70 mt-1">All orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Sales Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enhanced Daily Sales Chart */}
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 card-hover shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg animate-pulse">
                <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              Enhanced Sales Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={dailyData}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="50%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                    <linearGradient id="transactionGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                    <filter id="salesGlow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge> 
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="date" stroke="#64748b" />
                  <YAxis yAxisId="left" stroke="#64748b" />
                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255,255,255,0.95)', 
                      border: '1px solid rgba(0,0,0,0.1)',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value: any, name: any) => [
                      name === 'sales' ? formatAmount(value) : value,
                      name === 'sales' ? 'Revenue' : 'Transactions'
                    ]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="url(#salesGradient)"
                    strokeWidth={4}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6, filter: 'url(#salesGlow)' }}
                    activeDot={{ r: 8, filter: 'url(#salesGlow)' }}
                    animationDuration={1500}
                    animationEasing="ease-in-out"
                    yAxisId="left"
                    name="Revenue"
                  />
                  <Bar
                    dataKey="transactions"
                    fill="url(#transactionGradient)"
                    animationDuration={1200}
                    animationEasing="ease-out"
                    yAxisId="right"
                    name="Transactions"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Hourly Sales Pattern */}
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 card-hover shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg animate-pulse">
                <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              Hourly Sales Pattern
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData}>
                  <defs>
                    <linearGradient id="hourlyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                    </linearGradient>
                    <filter id="hourlyGlow">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                      <feMerge> 
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="hour" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255,255,255,0.95)', 
                      border: '1px solid rgba(0,0,0,0.1)',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value: any) => [`$${value}`, 'Sales']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#10b981" 
                    fillOpacity={1} 
                    fill="url(#hourlyGradient)"
                    strokeWidth={2}
                    filter="url(#hourlyGlow)"
                    animationDuration={1000}
                    animationEasing="ease-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transactions Chart */}
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 card-hover shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg animate-pulse">
                <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              Transactions per Day
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="50%" stopColor="#059669" />
                      <stop offset="100%" stopColor="#047857" />
                    </linearGradient>
                    <filter id="barGlow">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                      <feMerge> 
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="date" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255,255,255,0.95)', 
                      border: '1px solid rgba(0,0,0,0.1)',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }} 
                  />
                  <Bar 
                    dataKey="transactions" 
                    fill="url(#barGradient)" 
                    radius={[12, 12, 0, 0]}
                    filter="url(#barGlow)"
                    animationDuration={1200}
                    animationEasing="ease-out"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Order Status Breakdown */}
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 card-hover shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg animate-pulse">
                <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              Order Status & Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    <filter id="pieGlow">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                      <feMerge> 
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, percent, revenue }) => `${status} ${(percent * 100).toFixed(0)}% (${getCurrencySymbol()}${revenue.toFixed(0)})`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    filter="url(#pieGlow)"
                    animationDuration={1000}
                    animationEasing="ease-out"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255,255,255,0.95)', 
                      border: '1px solid rgba(0,0,0,0.1)',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value: any, name: any, props: any) => [
                      `${props.payload.count} orders - ${getCurrencySymbol()}${props.payload.revenue.toFixed(2)}`,
                      props.payload.status
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {statusData.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-slate-50/50 dark:bg-slate-700/30">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full shadow-sm chart-dot" 
                      style={{ '--dot-color': item.color } as React.CSSProperties}
                    ></div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.status}</span>
=======
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200/50 dark:border-purple-800/30 card-hover shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-purple-700 dark:text-purple-300">
                  <div className="p-1.5 bg-purple-500/20 rounded-lg animate-pulse">
                    <TrendingUp className="h-3 w-3 text-purple-600 dark:text-purple-400" />
>>>>>>> 5f411463074bad6df11ba165bf5c738866c9c6f9
                  </div>
                  Avg Order Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">${averageOrderValue}</p>
                <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">Per order</p>
              </CardContent>
            </Card>

<<<<<<< HEAD
        {/* Enhanced Payment Method Breakdown */}
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 card-hover shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg animate-pulse">
                <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              Enhanced Payment Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {paymentData.map((item, index) => (
                <div key={item.method} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full shadow-sm animate-pulse chart-dot" 
                        style={{ '--dot-color': item.color } as React.CSSProperties}
                      ></div>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{item.method}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 dark:text-slate-100">{formatAmount(item.value)}</span>
                      <span className="text-xs text-slate-600 dark:text-slate-400 ml-2">({item.count} tx)</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-5 overflow-hidden shadow-inner">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out shadow-lg progress-bar"
                      style={{
                        '--progress-width': `${(item.value / (totalRevenue / 100))}%`,
                        '--progress-gradient': `linear-gradient(90deg, ${['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'][index % 5]}, ${['#2563eb', '#7c3aed', '#db2777', '#d97706', '#059669'][index % 5]})`,
                        animation: `slideIn 0.7s ease-out ${index * 0.1}s both`
                      } as React.CSSProperties}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span>Avg Transaction: {formatAmount(item.avgTransaction)}</span>
                    <span>{((item.value / totalRevenue) * 100).toFixed(1)}% of total</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 card-hover shadow-lg hover:shadow-orange-500/10 transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg animate-pulse">
              <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            Sales by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    <filter id="categoryGlow">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                      <feMerge> 
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    filter="url(#categoryGlow)"
                    animationDuration={1200}
                    animationEasing="ease-out"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255,255,255,0.95)', 
                      border: '1px solid rgba(0,0,0,0.1)',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }} 
                    formatter={(value: any) => [`${getCurrencySymbol()}${value.toFixed(2)}`, 'Revenue']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {categoryData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50 dark:bg-slate-700/30 hover:bg-slate-100/70 dark:hover:bg-slate-700/50 transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-lg shadow-sm chart-dot" 
                      style={{ '--dot-color': item.color } as React.CSSProperties}
                    ></div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{item.category}</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{formatAmount(item.value)}</span>
                </div>
              ))}
            </div>
=======
            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-200/50 dark:border-orange-800/30 card-hover shadow-lg hover:shadow-orange-500/20 transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-orange-700 dark:text-orange-300">
                  <div className="p-1.5 bg-orange-500/20 rounded-lg animate-pulse">
                    <Calendar className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                  </div>
                  Completed Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">{soldOrders}</p>
                <p className="text-xs text-orange-600/70 dark:text-orange-400/70 mt-1">Finished orders</p>
              </CardContent>
            </Card>
>>>>>>> 5f411463074bad6df11ba165bf5c738866c9c6f9
          </div>

      {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Simple Line Chart */}
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 card-hover shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg animate-pulse">
                    <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  Sales Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 lg:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyData}>
                      <defs>
                        <linearGradient id="salesGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255,255,255,0.95)', 
                          border: '1px solid rgba(0,0,0,0.1)',
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                        formatter={(value: any) => [formatAmount(value), 'Revenue']}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="sales"
                        stroke="url(#salesGradient)"
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                        animationDuration={1500}
                        animationEasing="ease-in-out"
                        name="Revenue"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Order Status Pie Chart */}
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 card-hover shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg animate-pulse">
                    <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  Order Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartErrorBoundary>
                  {!statusData || statusData.length === 0 ? (
                    <div className="h-64 lg:h-80 flex items-center justify-center">
                      <p className="text-gray-500">No status data available</p>
                    </div>
                  ) : (
                    <div className="h-64 lg:h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <defs>
                            <filter id="pieGlow">
                              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                              <feMerge> 
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                              </feMerge>
                            </filter>
                          </defs>
                          <Pie
                            data={statusData || []}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ status, percent }) => `${status || 'Unknown'} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                            filter="url(#pieGlow)"
                            animationDuration={1000}
                            animationEasing="ease-out"
                          >
                            {(statusData || []).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color || ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index % 4]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(255,255,255,0.95)', 
                              border: '1px solid rgba(0,0,0,0.1)',
                              borderRadius: '12px',
                              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                            }}
                            formatter={(value: any, name: any, props: any) => [
                              `${props.payload?.count || 0} orders`,
                              props.payload?.status || 'Unknown'
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </ChartErrorBoundary>
              </CardContent>
            </Card>
          </div>

          {/* Sold Items Summary */}
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 card-hover shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg animate-pulse">
                  <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                Sold Items Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200/50 dark:border-green-800/30">
                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">{soldOrders}</div>
                    <div className="text-sm text-green-600 dark:text-green-400 mt-1">Items Sold</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/30">
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{formatAmount(soldRevenue)}</div>
                    <div className="text-sm text-blue-600 dark:text-blue-400 mt-1">Revenue from Sales</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200/50 dark:border-purple-800/30">
                    <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">${averageOrderValue}</div>
                    <div className="text-sm text-purple-600 dark:text-purple-400 mt-1">Avg per Item</div>
                  </div>
                </div>
                
                {/* Order Status Breakdown */}
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Order Status Breakdown</h4>
                  <div className="space-y-2">
                    {(statusData || []).map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50 dark:bg-slate-700/30 hover:bg-slate-100/70 dark:hover:bg-slate-700/50 transition-colors duration-200">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full shadow-sm`} style={{ backgroundColor: item.color || '#3b82f6' }}></div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.status}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{item.count}</span>
                          <span className="text-xs text-slate-600 dark:text-slate-400 ml-2">{formatAmount(item.revenue || 0)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sales Tab Content */}
        <TabsContent value="sales" className="space-y-6">
          {/* Sales Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-200/50 dark:border-green-800/30 card-hover shadow-lg hover:shadow-green-500/20 transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-300">
                  <div className="p-1.5 bg-green-500/20 rounded-lg animate-pulse">
                    <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </div>
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-700 dark:text-green-300">{formatAmount(totalRevenue)}</p>
                <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-1">All time sales</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200/50 dark:border-blue-800/30 card-hover shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300">
                  <div className="p-1.5 bg-blue-500/20 rounded-lg animate-pulse">
                    <Calendar className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  Avg Transaction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{formatAmount(averageTransaction)}</p>
                <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">Per order</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200/50 dark:border-purple-800/30 card-hover shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-purple-700 dark:text-purple-300">
                  <div className="p-1.5 bg-purple-500/20 rounded-lg animate-pulse">
                    <TrendingUp className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                  </div>
                  Peak Day
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {dailyData.length > 0 ? dailyData.reduce((max, day) => (day.sales > max.sales ? day : max), dailyData[0]).date : 'N/A'}
                </p>
                <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">Best sales day</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-200/50 dark:border-orange-800/30 card-hover shadow-lg hover:shadow-orange-500/20 transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-orange-700 dark:text-orange-300">
                  <div className="p-1.5 bg-orange-500/20 rounded-lg animate-pulse">
                    <Calendar className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                  </div>
                  Completion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">
                  {totalTransactions > 0 ? Math.round((soldOrders / totalTransactions) * 100) : 0}%
                </p>
                <p className="text-xs text-orange-600/70 dark:text-orange-400/70 mt-1">Orders completed</p>
              </CardContent>
            </Card>
          </div>
<<<<<<< HEAD
        </CardContent>
      </Card>
    </div>
  </div>
</div>
)}
=======

          {/* Sales Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Trend Chart */}
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 card-hover shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg animate-pulse">
                    <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  Sales Trend Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 lg:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyData}>
                      <defs>
                        <linearGradient id="salesGradient2" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255,255,255,0.95)', 
                          border: '1px solid rgba(0,0,0,0.1)',
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                        formatter={(value: any, name: any) => [
                          name === 'sales' ? formatAmount(value) : value,
                          name === 'sales' ? 'Revenue' : 'Transactions'
                        ]}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="sales"
                        stroke="url(#salesGradient2)"
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                        animationDuration={1500}
                        animationEasing="ease-in-out"
                        name="Revenue"
                      />
                      <Line
                        type="monotone"
                        dataKey="transactions"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                        activeDot={{ r: 5 }}
                        animationDuration={1200}
                        animationEasing="ease-out"
                        name="Transactions"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Breakdown */}
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 card-hover shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg animate-pulse">
                    <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  Payment Methods
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 lg:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <defs>
                        <filter id="paymentGlow">
                          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                          <feMerge> 
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>
                      <Pie
                        data={paymentData || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ method, percent }) => `${method} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        filter="url(#paymentGlow)"
                        animationDuration={1000}
                        animationEasing="ease-out"
                      >
                        {(paymentData || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index % 4]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255,255,255,0.95)', 
                          border: '1px solid rgba(0,0,0,0.1)',
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                        formatter={(value: any, name: any, props: any) => [
                          formatAmount(value),
                          props.payload?.method || 'Unknown'
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Payment Details */}
                <div className="mt-4 space-y-2">
                  {(paymentData || []).map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-slate-50/50 dark:bg-slate-700/30">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full shadow-sm`} style={{ backgroundColor: item.color || '#3b82f6' }}></div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.method}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{formatAmount(item.value)}</span>
                        <span className="text-xs text-slate-600 dark:text-slate-400 ml-2">({item.count} tx)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sales Performance Table */}
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 card-hover shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg animate-pulse">
                  <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                Daily Sales Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/30">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Date</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Revenue</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Transactions</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Avg Order</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyData.map((day, idx) => {
                      const dayPerformance = totalRevenue > 0 ? (day.sales / totalRevenue) * 100 : 0
                      const performanceColor = dayPerformance >= 20 ? 'text-emerald-600' : dayPerformance >= 10 ? 'text-yellow-600' : 'text-red-600'
                      
                      return (
                        <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/70 dark:hover:bg-slate-700/40 transition-colors duration-200">
                          <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">{day.date}</td>
                          <td className="text-right py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">{formatAmount(day.sales)}</td>
                          <td className="text-right py-3 px-4 text-slate-600 dark:text-slate-400">{day.transactions}</td>
                          <td className="text-right py-3 px-4 text-slate-600 dark:text-slate-400">{formatAmount(day.avgOrderValue)}</td>
                          <td className="text-right py-3 px-4">
                            <span className={`font-medium ${performanceColor} dark:${performanceColor.replace('600', '400')}`}>
                              {dayPerformance.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Items Tab Content */}
        <TabsContent value="items" className="space-y-6">
          {/* Items Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200/50 dark:border-purple-800/30 card-hover shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-purple-700 dark:text-purple-300">
                  <div className="p-1.5 bg-purple-500/20 rounded-lg animate-pulse">
                    <TrendingUp className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                  </div>
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">{categoryData.length}</p>
                <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">Active categories</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200/50 dark:border-blue-800/30 card-hover shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300">
                  <div className="p-1.5 bg-blue-500/20 rounded-lg animate-pulse">
                    <TrendingUp className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  Top Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold text-blue-700 dark:text-blue-300 truncate">
                  {categoryData.length > 0 ? categoryData.reduce((max, cat) => (cat.value > max.value ? cat : max), categoryData[0]).category : 'N/A'}
                </p>
                <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">Best performer</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-200/50 dark:border-green-800/30 card-hover shadow-lg hover:shadow-green-500/20 transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-300">
                  <div className="p-1.5 bg-green-500/20 rounded-lg animate-pulse">
                    <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </div>
                  Avg Item Price
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                  {categoryData.length > 0 ? formatAmount(categoryData.reduce((sum, cat) => sum + (cat.avgPrice || 0), 0) / categoryData.length) : 'UGX 0'}
                </p>
                <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-1">Per category</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-200/50 dark:border-orange-800/30 card-hover shadow-lg hover:shadow-orange-500/20 transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-orange-700 dark:text-orange-300">
                  <div className="p-1.5 bg-orange-500/20 rounded-lg animate-pulse">
                    <TrendingUp className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                  </div>
                  Total Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">
                  {categoryData.reduce((sum, cat) => sum + (cat.items || 0), 0)}
                </p>
                <p className="text-xs text-orange-600/70 dark:text-orange-400/70 mt-1">Items sold</p>
              </CardContent>
            </Card>
          </div>

          {/* Category Performance Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Pie Chart */}
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 card-hover shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg animate-pulse">
                    <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  Category Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 lg:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <defs>
                        <filter id="categoryGlow2">
                          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                          <feMerge> 
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>
                      <Pie
                        data={categoryData || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        filter="url(#categoryGlow2)"
                        animationDuration={1000}
                        animationEasing="ease-out"
                      >
                        {(categoryData || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || ['#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'][index % 4]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255,255,255,0.95)', 
                          border: '1px solid rgba(0,0,0,0.1)',
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                        formatter={(value: any, name: any, props: any) => [
                          formatAmount(value),
                          props.payload?.category || 'Unknown'
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Category Bar Chart */}
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 card-hover shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg animate-pulse">
                    <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  Category Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 lg:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData} layout="horizontal">
                      <defs>
                        <linearGradient id="barGradient2" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                      <XAxis type="number" stroke="#64748b" fontSize={12} />
                      <YAxis dataKey="category" type="category" stroke="#64748b" fontSize={12} width={80} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255,255,255,0.95)', 
                          border: '1px solid rgba(0,0,0,0.1)',
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                        formatter={(value: any) => [formatAmount(value), 'Revenue']}
                      />
                      <Bar 
                        dataKey="value" 
                        fill="url(#barGradient2)" 
                        radius={[0, 4, 4, 0]}
                        animationDuration={1200}
                        animationEasing="ease-out"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Details Table */}
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 card-hover shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg animate-pulse">
                  <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                Category Performance Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/30">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Category</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Revenue</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Items Sold</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Avg Price</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryData.map((category, idx) => {
                      const categoryPerformance = totalRevenue > 0 ? (category.value / totalRevenue) * 100 : 0
                      const performanceColor = categoryPerformance >= 30 ? 'text-emerald-600' : categoryPerformance >= 15 ? 'text-yellow-600' : 'text-red-600'
                      
                      return (
                        <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/70 dark:hover:bg-slate-700/40 transition-colors duration-200">
                          <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full shadow-sm`} style={{ backgroundColor: category.color || '#8b5cf6' }}></div>
                              {category.category}
                            </div>
                          </td>
                          <td className="text-right py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">{formatAmount(category.value)}</td>
                          <td className="text-right py-3 px-4 text-slate-600 dark:text-slate-400">{category.items || 0}</td>
                          <td className="text-right py-3 px-4 text-slate-600 dark:text-slate-400">{formatAmount(category.avgPrice)}</td>
                          <td className="text-right py-3 px-4">
                            <span className={`font-medium ${performanceColor} dark:${performanceColor.replace('600', '400')}`}>
                              {categoryPerformance.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staff Tab Content */}
        <TabsContent value="staff" className="space-y-6">
          {/* Staff Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border-indigo-200/50 dark:border-indigo-800/30 card-hover shadow-lg hover:shadow-indigo-500/20 transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-indigo-700 dark:text-indigo-300">
                  <div className="p-1.5 bg-indigo-500/20 rounded-lg animate-pulse">
                    <TrendingUp className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  Active Staff
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">{staffData?.summary?.activeStaff || 0}</p>
                <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70 mt-1">Currently working</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200/50 dark:border-blue-800/30 card-hover shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300">
                  <div className="p-1.5 bg-blue-500/20 rounded-lg animate-pulse">
                    <TrendingUp className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  Avg Efficiency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{staffData?.summary?.averageEfficiency?.toFixed(1) || 0}%</p>
                <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">Order completion</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-200/50 dark:border-green-800/30 card-hover shadow-lg hover:shadow-green-500/20 transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-300">
                  <div className="p-1.5 bg-green-500/20 rounded-lg animate-pulse">
                    <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </div>
                  Top Performer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold text-green-700 dark:text-green-300 truncate">
                  {staffData?.staffPerformance?.[0]?.name || 'N/A'}
                </p>
                <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-1">Best staff member</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200/50 dark:border-purple-800/30 card-hover shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-purple-700 dark:text-purple-300">
                  <div className="p-1.5 bg-purple-500/20 rounded-lg animate-pulse">
                    <TrendingUp className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                  </div>
                  Shift Coverage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                  {staffData?.summary?.completedShifts && staffData?.summary?.totalShifts > 0 ? 
                    Math.round((staffData.summary.completedShifts / staffData.summary.totalShifts) * 100) : 0}%
                </p>
                <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">Staff utilization</p>
              </CardContent>
            </Card>
          </div>

          {/* Staff Performance Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Staff Performance Bar Chart */}
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 card-hover shadow-lg hover:shadow-indigo-500/10 transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg animate-pulse">
                    <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  Staff Performance Rankings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 lg:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={staffData?.staffPerformance?.slice(0, 10) || []} layout="horizontal">
                      <defs>
                        <linearGradient id="staffGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                      <XAxis type="number" stroke="#64748b" fontSize={12} />
                      <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} width={80} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255,255,255,0.95)', 
                          border: '1px solid rgba(0,0,0,0.1)',
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                        formatter={(value: any, name: any) => [
                          name === 'totalRevenue' ? formatAmount(value) : value,
                          name === 'totalRevenue' ? 'Revenue' : name === 'totalOrders' ? 'Orders' : 'Efficiency'
                        ]}
                      />
                      <Bar 
                        dataKey="totalRevenue" 
                        fill="url(#staffGradient)" 
                        radius={[0, 4, 4, 0]}
                        animationDuration={1200}
                        animationEasing="ease-out"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Staff Efficiency Pie Chart */}
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 card-hover shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg animate-pulse">
                    <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  Staff Activity Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 lg:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <defs>
                        <filter id="staffActivityGlow">
                          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                          <feMerge> 
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>
                      <Pie
                        data={staffData?.userActivity?.map((activity: any, index: number) => ({
                          ...activity,
                          color: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'][index % 5]
                        })) || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        filter="url(#staffActivityGlow)"
                        animationDuration={1000}
                        animationEasing="ease-out"
                      >
                        {(staffData?.userActivity || []).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'][index % 5]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255,255,255,0.95)', 
                          border: '1px solid rgba(0,0,0,0.1)',
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                        formatter={(value: any, name: any, props: any) => [
          value,
          props.payload?.type || 'Unknown'
        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Staff Performance Details Table */}
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 card-hover shadow-lg hover:shadow-indigo-500/10 transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg animate-pulse">
                  <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                Staff Performance Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/30">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Staff Name</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Orders</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Revenue</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Avg Order</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Efficiency</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Days Worked</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffData?.staffPerformance?.map((staff: any, idx: number) => {
                      const efficiencyColor = staff.efficiencyScore >= 80 ? 'text-emerald-600' : staff.efficiencyScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                      
                      return (
                        <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/70 dark:hover:bg-slate-700/40 transition-colors duration-200">
                          <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                            <div>
                              <div className="font-medium">{staff.name}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">{staff.role}</div>
                            </div>
                          </td>
                          <td className="text-right py-3 px-4 text-slate-600 dark:text-slate-400">{staff.totalOrders}</td>
                          <td className="text-right py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">{formatAmount(staff.totalRevenue)}</td>
                          <td className="text-right py-3 px-4 text-slate-600 dark:text-slate-400">{formatAmount(staff.averageOrderValue)}</td>
                          <td className="text-right py-3 px-4">
                            <span className={`font-medium ${efficiencyColor} dark:${efficiencyColor.replace('600', '400')}`}>
                              {staff.efficiencyScore.toFixed(1)}%
                            </span>
                          </td>
                          <td className="text-right py-3 px-4 text-slate-600 dark:text-slate-400">{staff.daysWorked}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax & Profit Tab Content */}
        <TabsContent value="tax-profit" className="space-y-6">
          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-200/50 dark:border-emerald-800/30 card-hover shadow-lg hover:shadow-emerald-500/20 transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  <div className="p-1.5 bg-emerald-500/20 rounded-lg animate-pulse">
                    <TrendingUp className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  Gross Profit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">{formatAmount(financialData?.summary?.grossProfit || 0)}</p>
                <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-1">Total profit</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200/50 dark:border-blue-800/30 card-hover shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300">
                  <div className="p-1.5 bg-blue-500/20 rounded-lg animate-pulse">
                    <TrendingUp className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  Profit Margin
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{(financialData?.summary?.profitMargin || 0).toFixed(1)}%</p>
                <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">Profit percentage</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-200/50 dark:border-orange-800/30 card-hover shadow-lg hover:shadow-orange-500/20 transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-orange-700 dark:text-orange-300">
                  <div className="p-1.5 bg-orange-500/20 rounded-lg animate-pulse">
                    <TrendingUp className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                  </div>
                  Total Tax
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">{formatAmount(financialData?.summary?.totalTax || 0)}</p>
                <p className="text-xs text-orange-600/70 dark:text-orange-400/70 mt-1">Tax collected</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200/50 dark:border-purple-800/30 card-hover shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-purple-700 dark:text-purple-300">
                  <div className="p-1.5 bg-purple-500/20 rounded-lg animate-pulse">
                    <TrendingUp className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                  </div>
                  Net Profit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">{formatAmount(financialData?.summary?.netProfit || 0)}</p>
                <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">After tax</p>
              </CardContent>
            </Card>
          </div>

          {/* Financial Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profit Trend Chart */}
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 card-hover shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg animate-pulse">
                    <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  Profit Trend Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 lg:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={financialData?.dailyData || []}>
                      <defs>
                        <linearGradient id="profitGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255,255,255,0.95)', 
                          border: '1px solid rgba(0,0,0,0.1)',
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                        formatter={(value: any, name: any) => [
                          name === 'grossProfit' || name === 'netProfit' ? formatAmount(value) : value,
                          name === 'grossProfit' ? 'Gross Profit' : name === 'netProfit' ? 'Net Profit' : name === 'totalRevenue' ? 'Revenue' : 'Tax'
                        ]}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="grossProfit"
                        stroke="url(#profitGradient)"
                        strokeWidth={3}
                        dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                        animationDuration={1500}
                        animationEasing="ease-in-out"
                        name="Gross Profit"
                      />
                      <Line
                        type="monotone"
                        dataKey="netProfit"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                        activeDot={{ r: 5 }}
                        animationDuration={1200}
                        animationEasing="ease-out"
                        name="Net Profit"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Category Profit Pie Chart */}
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 card-hover shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg animate-pulse">
                    <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  Profit by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 lg:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <defs>
                        <filter id="categoryProfitGlow">
                          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                          <feMerge> 
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>
                      <Pie
                        data={financialData?.categoryProfit?.map((cat: any, index: number) => ({
                          ...cat,
                          color: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]
                        })) || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="profit"
                        filter="url(#categoryProfitGlow)"
                        animationDuration={1000}
                        animationEasing="ease-out"
                      >
                        {(financialData?.categoryProfit || []).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255,255,255,0.95)', 
                          border: '1px solid rgba(0,0,0,0.1)',
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                        formatter={(value: any, name: any, props: any) => [
                          formatAmount(value),
                          props.payload?.category || 'Unknown'
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Financial Details Table */}
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 card-hover shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg animate-pulse">
                  <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                Category Profit Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/30">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Category</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Revenue</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Cost</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Profit</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Margin</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Items</th>
                    </tr>
                  </thead>
                  <tbody>
                    {financialData?.categoryProfit?.map((category: any, idx: number) => {
                      const marginColor = category.profitMargin >= 30 ? 'text-emerald-600' : category.profitMargin >= 15 ? 'text-yellow-600' : 'text-red-600'
                      
                      return (
                        <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/70 dark:hover:bg-slate-700/40 transition-colors duration-200">
                          <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full shadow-sm`} style={{ backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][idx % 5] }}></div>
                              {category.category}
                            </div>
                          </td>
                          <td className="text-right py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">{formatAmount(category.revenue)}</td>
                          <td className="text-right py-3 px-4 text-slate-600 dark:text-slate-400">{formatAmount(category.cost)}</td>
                          <td className="text-right py-3 px-4 font-bold text-blue-600 dark:text-blue-400">{formatAmount(category.profit)}</td>
                          <td className="text-right py-3 px-4">
                            <span className={`font-medium ${marginColor} dark:${marginColor.replace('600', '400')}`}>
                              {category.profitMargin.toFixed(1)}%
                            </span>
                          </td>
                          <td className="text-right py-3 px-4 text-slate-600 dark:text-slate-400">{category.itemCount}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}
>>>>>>> 5f411463074bad6df11ba165bf5c738866c9c6f9
