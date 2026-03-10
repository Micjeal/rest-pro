'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TrendingUp, DollarSign, Calendar } from 'lucide-react'

interface RevenueChartProps {
  data?: Array<{ month: string; revenue: number }>
  isLoading?: boolean
  currentPeriod?: string
  onPeriodChange?: (period: string) => void
}

export function RevenueChart({ 
  data, 
  isLoading = false, 
  currentPeriod = 'week',
  onPeriodChange 
}: RevenueChartProps) {
  // Only show data if provided and has real values
  const hasRealData = data && data.length > 0 && data.some(item => item.revenue > 0)
  
  if (isLoading || !hasRealData) {
    return (
      <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200/50 dark:border-blue-800/30 shadow-lg hover:shadow-lg transition-all duration-300">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              <div className="p-1.5 bg-white/20 rounded-lg">
                <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              Total Revenue
            </div>
            <div className="flex items-center gap-2">
              <Select value={currentPeriod} onValueChange={onPeriodChange} disabled={isLoading}>
                <SelectTrigger className="w-28 h-8 bg-white/50 dark:bg-slate-700/50 border-blue-200/50 dark:border-blue-800/30 text-xs">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <SelectValue placeholder="Period" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="quarter">Quarter</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
              <div className="p-1.5 bg-blue-500/20 rounded-lg animate-pulse">
                <TrendingUp className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-64 animate-pulse bg-blue-100/30 dark:bg-blue-900/20 rounded-lg"></div>
          ) : (
            <div className="h-64 flex items-center justify-center text-blue-600/70 dark:text-blue-400/70">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="font-medium">No revenue data available</p>
                <p className="text-sm opacity-70">Complete some orders to see revenue trends</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const formatYAxis = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}k`
    }
    return `$${value}`
  }

  const formatTooltip = (value: number) => {
    return `$${value.toLocaleString()}`
  }

  return (
    <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200/50 dark:border-blue-800/30 shadow-lg hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            Total Revenue
          </div>
          <div className="flex items-center gap-2">
            <Select value={currentPeriod} onValueChange={onPeriodChange} disabled={isLoading}>
              <SelectTrigger className="w-28 h-8 bg-white/50 dark:bg-slate-700/50 border-blue-200/50 dark:border-blue-800/30 text-xs">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <SelectValue placeholder="Period" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="quarter">Quarter</SelectItem>
                <SelectItem value="year">Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            <div className="p-1.5 bg-blue-500/20 rounded-lg">
              <TrendingUp className="h-3 w-3 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="opacity-30" />
              <XAxis 
                dataKey="month" 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tickFormatter={formatYAxis}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip 
                formatter={formatTooltip}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #3b82f6',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar 
                dataKey="revenue" 
                fill="url(#revenueGradient)"
                radius={[4, 4, 0, 0]}
              />
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.6}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
