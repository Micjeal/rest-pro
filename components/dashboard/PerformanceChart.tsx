'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface PerformanceChartProps {
  data?: Array<{ name: string; value: number; color: string }>
  totalCount?: number
  isLoading?: boolean
}

const defaultPerformanceData = [
  { name: 'Completed', value: 65, color: '#10b981' },
  { name: 'Processing', value: 20, color: '#3b82f6' },
  { name: 'Pending', value: 10, color: '#f59e0b' },
  { name: 'Cancelled', value: 5, color: '#ef4444' }
]

export function PerformanceChart({ 
  data, 
  totalCount = 2375,
  isLoading = false 
}: PerformanceChartProps) {
  // Use real data if provided, otherwise use default
  const chartData = data && data.length > 0 ? data : defaultPerformanceData
  
  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </CardContent>
      </Card>
    )
  }

  const RADIAN = Math.PI / 180
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  const formatTooltip = (value: number) => {
    return `${value}%`
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
          Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Donut Chart */}
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={formatTooltip} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Center Text */}
          <div className="text-center -mt-32">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {totalCount.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Count
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-2 mt-8">
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
                </div>
                <span className="text-gray-600 dark:text-gray-400">{item.value}%</span>
              </div>
            ))}
          </div>

          {/* Additional Info */}
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2">
            Keep your info updated to increase the number of interactions
          </div>

          {/* Metrics */}
          <div className="flex justify-between text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
            <div>
              <span className="text-gray-600 dark:text-gray-400">View Count</span>
            </div>
            <div>
              <span className="text-gray-900 dark:text-white font-medium">Percentage {chartData[0]?.value || 0}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
