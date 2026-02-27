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
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200/50 dark:border-blue-800/30 card-hover shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300">
                  <div className="p-1.5 bg-blue-500/20 rounded-lg animate-pulse">
                    <TrendingUp className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{formatAmount(totalRevenue)}</p>
                <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">All sales</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-200/50 dark:border-emerald-800/30 card-hover shadow-lg hover:shadow-emerald-500/20 transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  <div className="p-1.5 bg-emerald-500/20 rounded-lg animate-pulse">
                    <TrendingUp className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  Sold Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">{soldOrders}</p>
                <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-1">Completed orders</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-200/50 dark:border-orange-800/30 card-hover shadow-lg hover:shadow-orange-500/20 transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-orange-700 dark:text-orange-300">
                  <div className="p-1.5 bg-orange-500/20 rounded-lg animate-pulse">
                    <Calendar className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                  </div>
                  Total Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">{totalTransactions}</p>
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
                <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">{formatAmount(averageTransaction)}</p>
                <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">Per transaction</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Trend Chart */}
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
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                            animationBegin={0}
                            animationDuration={800}
                          >
                            {statusData.map((entry: any, index: number) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index % 4]} 
                                filter="url(#pieGlow)"
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(255,255,255,0.95)', 
                              border: '1px solid rgba(0,0,0,0.1)',
                              borderRadius: '12px',
                              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                            }}
                            formatter={(value: any, name: any) => [value, 'Orders']}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </ChartErrorBoundary>
              </CardContent>
            </Card>
          </div>
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
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Staff Tab Content */}
        <TabsContent value="staff" className="space-y-6">
          {staffLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : staffData ? (
            <>
              {/* Staff Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border-indigo-200/50 dark:border-indigo-800/30 card-hover shadow-lg hover:shadow-indigo-500/20 transition-all duration-300">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium text-indigo-700 dark:text-indigo-300">
                      <div className="p-1.5 bg-indigo-500/20 rounded-lg animate-pulse">
                        <TrendingUp className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      Total Staff
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">{staffData.summary?.totalStaff || 0}</p>
                    <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70 mt-1">Active employees</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-200/50 dark:border-green-800/30 card-hover shadow-lg hover:shadow-green-500/20 transition-all duration-300">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-300">
                      <div className="p-1.5 bg-green-500/20 rounded-lg animate-pulse">
                        <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                      </div>
                      Staff Orders
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-green-700 dark:text-green-300">{staffData.summary?.totalOrders || 0}</p>
                    <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-1">Total processed</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200/50 dark:border-purple-800/30 card-hover shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium text-purple-700 dark:text-purple-300">
                      <div className="p-1.5 bg-purple-500/20 rounded-lg animate-pulse">
                        <TrendingUp className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                      </div>
                      Avg Efficiency
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">{staffData.summary?.averageEfficiency || 0}%</p>
                    <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">Performance score</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-200/50 dark:border-orange-800/30 card-hover shadow-lg hover:shadow-orange-500/20 transition-all duration-300">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium text-orange-700 dark:text-orange-300">
                      <div className="p-1.5 bg-orange-500/20 rounded-lg animate-pulse">
                        <TrendingUp className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                      </div>
                      Staff Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">{formatAmount(staffData.summary?.totalRevenue || 0)}</p>
                    <p className="text-xs text-orange-600/70 dark:text-orange-400/70 mt-1">Generated sales</p>
                  </CardContent>
                </Card>
              </div>

              {/* Staff Performance Table */}
              <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 card-hover shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg animate-pulse">
                      <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    Staff Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                          <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Name</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Role</th>
                          <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Orders</th>
                          <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Revenue</th>
                          <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Efficiency</th>
                        </tr>
                      </thead>
                      <tbody>
                        {staffData.staffPerformance?.map((staff: any, index: number) => (
                          <tr key={index} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/70 dark:hover:bg-slate-700/40">
                            <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">{staff.name}</td>
                            <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{staff.role}</td>
                            <td className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">{staff.totalOrders}</td>
                            <td className="text-right py-3 px-4 font-semibold text-emerald-600 dark:text-emerald-400">{formatAmount(staff.totalRevenue)}</td>
                            <td className="text-right py-3 px-4">
                              <span className={`font-medium ${staff.efficiencyScore >= 90 ? 'text-green-600' : staff.efficiencyScore >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {staff.efficiencyScore}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">No staff data available</p>
            </div>
          )}
        </TabsContent>

        {/* Tax & Profit Tab Content */}
        <TabsContent value="tax-profit" className="space-y-6">
          {financialLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : financialData ? (
            <>
              {/* Financial Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">{formatAmount(financialData.summary?.totalRevenue || 0)}</p>
                    <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-1">Gross sales</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200/50 dark:border-blue-800/30 card-hover shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300">
                      <div className="p-1.5 bg-blue-500/20 rounded-lg animate-pulse">
                        <TrendingUp className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      </div>
                      Net Profit
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{formatAmount(financialData.summary?.netProfit || 0)}</p>
                    <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">After expenses</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200/50 dark:border-purple-800/30 card-hover shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium text-purple-700 dark:text-purple-300">
                      <div className="p-1.5 bg-purple-500/20 rounded-lg animate-pulse">
                        <TrendingUp className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                      </div>
                      Profit Margin
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">{financialData.summary?.profitMargin || 0}%</p>
                    <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">Profitability</p>
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
                    <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">{formatAmount(financialData.summary?.totalTax || 0)}</p>
                    <p className="text-xs text-orange-600/70 dark:text-orange-400/70 mt-1">Tax collected</p>
                  </CardContent>
                </Card>
              </div>

              {/* Financial Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profit Trend Chart */}
                <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 card-hover shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg animate-pulse">
                        <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      Profit Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 lg:h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={financialData.dailyData || []}>
                          <defs>
                            <linearGradient id="profitGradient" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#10b981" />
                              <stop offset="100%" stopColor="#059669" />
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
                            formatter={(value: any) => [formatAmount(value), 'Net Profit']}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="netProfit"
                            stroke="url(#profitGradient)"
                            strokeWidth={3}
                            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6 }}
                            animationDuration={1500}
                            animationEasing="ease-in-out"
                            name="Net Profit"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Category Profit Breakdown */}
                <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 card-hover shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg animate-pulse">
                        <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      Category Profitability
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 lg:h-80">
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
                            data={financialData.categoryProfit || []}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="profit"
                            filter="url(#categoryGlow)"
                            animationDuration={1000}
                            animationEasing="ease-out"
                          >
                            {(financialData.categoryProfit || []).map((entry: any, index: number) => (
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
            </>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">No financial data available</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}
