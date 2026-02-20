'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'
import { Calendar, Download, TrendingUp, Shield } from 'lucide-react'
import { useRestaurants } from '@/hooks/use-restaurants'
import { useToast } from '@/hooks/use-toast'

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
  
  const router = useRouter()
  const { toast } = useToast()
  
  // Use real data from hooks
  const { restaurants, isLoading: restaurantsLoading } = useRestaurants()

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

  const handleExportReport = () => {
    const reportData = {
      generated: new Date().toISOString(),
      dateRange: dateRange,
      summary: {
        totalRevenue: totalRevenue,
        totalTransactions: totalTransactions,
        averageTransaction: averageTransaction,
        soldOrders: soldOrders,
        clearedOrders: clearedOrders,
        soldRevenue: soldRevenue,
        totalOrderRevenue: totalOrderRevenue,
        averageOrderValue: averageOrderValue
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
        bestDay: dailyData.length > 0 ? dailyData.reduce((max, day) => (day.sales > max.sales ? day : max)) : null,
        worstDay: dailyData.length > 0 ? dailyData.reduce((min, day) => (day.sales < min.sales ? day : min)) : null,
        peakHour: hourlyData.length > 0 ? hourlyData.reduce((max, hour) => (hour.sales > max.sales ? hour : max)) : null,
        topCategory: categoryData.length > 0 ? categoryData.reduce((max, cat) => (cat.value > max.value ? cat : max)) : null,
        topPaymentMethod: paymentData.length > 0 ? paymentData.reduce((max, pay) => (pay.value > max.value ? pay : max)) : null
      }
    }
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `enhanced-reports-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const totalRevenue = dailyData.reduce((sum, day) => sum + day.sales, 0)
  const totalTransactions = dailyData.reduce((sum, day) => sum + day.transactions, 0)
  const averageTransaction = totalTransactions > 0 ? (totalRevenue / totalTransactions).toFixed(2) : '0.00'
  
  // Calculate sold and cleared orders from status data
  const soldOrders = statusData.find((s: any) => s.status === 'Completed')?.count || 0
  const clearedOrders = statusData.reduce((sum: number, s: any) => sum + s.count, 0)
  
  // Calculate revenue metrics from API data
  const soldRevenue = statusData.find((s: any) => s.status === 'Completed')?.revenue || 0
  const totalOrderRevenue = statusData.reduce((sum: number, s: any) => sum + (s.revenue || 0), 0)
  const averageOrderValue = totalOrderRevenue > 0 ? (totalOrderRevenue / clearedOrders).toFixed(2) : '0.00'

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
      {/* Header Section */}
      <div className="relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-b border-slate-200/60 dark:border-slate-700/60">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-indigo-500/5"></div>
        <div className="relative px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                    Reports & Analytics
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 text-lg">Sales trends and performance metrics</p>
                </div>
              </div>
            </div>
            <Button 
              onClick={handleExportReport}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 btn-press"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">

      {/* Controls Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Restaurant Selector */}
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 card-hover shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
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
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
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
            <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">${totalRevenue.toFixed(2)}</p>
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
            <p className="text-3xl font-bold text-green-700 dark:text-green-300">${soldRevenue.toFixed(2)}</p>
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
            <p className="text-3xl font-bold text-pink-700 dark:text-pink-300">${totalOrderRevenue.toFixed(2)}</p>
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
                <LineChart data={dailyData}>
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
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255,255,255,0.95)', 
                      border: '1px solid rgba(0,0,0,0.1)',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value: any, name: any) => [
                      name === 'sales' ? `$${value}` : value,
                      name === 'sales' ? 'Sales' : 'Transactions'
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
                    name="Sales"
                  />
                  <Line
                    type="monotone"
                    dataKey="transactions"
                    stroke="url(#transactionGradient)"
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                    animationDuration={1200}
                    animationEasing="ease-out"
                    name="Transactions"
                    yAxisId="right"
                  />
                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                </LineChart>
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
                    label={({ status, percent, revenue }) => `${status} ${(percent * 100).toFixed(0)}% ($${revenue.toFixed(0)})`}
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
                      `${props.payload.count} orders - $${props.payload.revenue.toFixed(2)}`,
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
                      className="w-3 h-3 rounded-full shadow-sm" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.status}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{item.count}</span>
                    <span className="text-xs text-slate-600 dark:text-slate-400 ml-2">${item.revenue.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
                        className="w-4 h-4 rounded-full shadow-sm animate-pulse" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{item.method}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 dark:text-slate-100">${item.value.toFixed(2)}</span>
                      <span className="text-xs text-slate-600 dark:text-slate-400 ml-2">({item.count} tx)</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-5 overflow-hidden shadow-inner">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out shadow-lg"
                      style={{
                        width: `${(item.value / (totalRevenue / 100))}%`,
                        background: `linear-gradient(90deg, ${['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'][index % 5]}, ${['#2563eb', '#7c3aed', '#db2777', '#d97706', '#059669'][index % 5]})`,
                        animation: `slideIn 0.7s ease-out ${index * 0.1}s both`
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span>Avg Transaction: ${item.avgTransaction.toFixed(2)}</span>
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
                    formatter={(value: any) => [`$${value.toFixed(2)}`, 'Revenue']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {categoryData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50 dark:bg-slate-700/30 hover:bg-slate-100/70 dark:hover:bg-slate-700/50 transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-lg shadow-sm" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{item.category}</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-slate-100">${item.value.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Daily Breakdown */}
      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 card-hover shadow-lg hover:shadow-slate-500/10 transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-1.5 bg-slate-100 dark:bg-slate-700/30 rounded-lg animate-pulse">
              <TrendingUp className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </div>
            Enhanced Daily Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/30">
                  <th className="text-left py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">Day</th>
                  <th className="text-right py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">Sales</th>
                  <th className="text-right py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">Transactions</th>
                  <th className="text-right py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">Avg/Transaction</th>
                  <th className="text-right py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">Performance</th>
                </tr>
              </thead>
              <tbody>
                {dailyData.map((day, idx) => {
                  const avgOrderValue = day.avgOrderValue || (day.sales / day.transactions)
                  const dayPerformance = totalRevenue > 0 ? (day.sales / totalRevenue) * 100 : 0
                  const performanceColor = dayPerformance >= 20 ? 'text-emerald-600' : dayPerformance >= 10 ? 'text-yellow-600' : 'text-red-600'
                  const performanceIcon = dayPerformance >= 20 ? '📈' : dayPerformance >= 10 ? '📊' : '📉'
                  
                  return (
                    <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/70 dark:hover:bg-slate-700/40 transition-all duration-200 hover:scale-[1.01]">
                      <td className="py-4 px-4 font-medium text-slate-700 dark:text-slate-300">{day.date}</td>
                      <td className="text-right py-4 px-4 font-bold text-emerald-600 dark:text-emerald-400">${day.sales.toFixed(2)}</td>
                      <td className="text-right py-4 px-4 text-slate-600 dark:text-slate-400">{day.transactions}</td>
                      <td className="text-right py-4 px-4 text-slate-600 dark:text-slate-400">
                        ${avgOrderValue.toFixed(2)}
                      </td>
                      <td className="text-right py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <span className={`font-medium ${performanceColor} dark:${performanceColor.replace('600', '400')}`}>
                            {dayPerformance.toFixed(1)}%
                          </span>
                          <span className="text-lg">{performanceIcon}</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-700/50 font-semibold">
                  <td className="py-4 px-4 text-slate-700 dark:text-slate-300">Total</td>
                  <td className="text-right py-4 px-4 font-bold text-emerald-600 dark:text-emerald-400">${totalRevenue.toFixed(2)}</td>
                  <td className="text-right py-4 px-4 text-slate-700 dark:text-slate-300">{totalTransactions}</td>
                  <td className="text-right py-4 px-4 text-slate-700 dark:text-slate-300">${averageTransaction}</td>
                  <td className="text-right py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <span className="font-medium text-blue-600 dark:text-blue-400">100%</span>
                      <span className="text-lg">🎯</span>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
    </div>
  )
}
