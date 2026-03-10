'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Plus, Download, Calendar } from 'lucide-react'
import Link from 'next/link'

interface LastReportsProps {
  isLoading?: boolean
}

const reportsData = [
  {
    id: 1,
    title: 'July Report 2024',
    date: '2024-07-31',
    type: 'monthly'
  },
  {
    id: 2,
    title: 'June Report 2024',
    date: '2024-06-30',
    type: 'monthly'
  }
]

export function LastReports({ isLoading = false }: LastReportsProps) {
  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-900 dark:text-white">Last Reports</span>
            <div className="animate-pulse h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-900 dark:text-white">Last Reports</span>
          <Link href="/reports">
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
              See all
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Report Cards */}
          <div className="space-y-3">
            {reportsData.map((report) => (
              <div 
                key={report.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {report.title}
                      </h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Calendar className="h-3 w-3 text-gray-500" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(report.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Create New Report Card */}
          <Link href="/reports/create">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer group">
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                  <Plus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Create New
                </span>
              </div>
            </div>
          </Link>

          {/* Download PDF Button */}
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
