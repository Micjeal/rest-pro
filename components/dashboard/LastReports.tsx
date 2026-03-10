'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Plus, Download, Calendar, Eye, Trash2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useReports } from '@/hooks/use-reports'
import { useRestaurants } from '@/hooks/use-restaurants'
import { useCurrentUser } from '@/hooks/use-current-user'
import { toast } from 'sonner'

interface LastReportsProps {
  isLoading?: boolean
}

export function LastReports({ isLoading: externalLoading = false }: LastReportsProps) {
  const [isDownloading, setIsDownloading] = useState<string | null>(null)
  
  const { user: currentUser } = useCurrentUser()
  const { restaurants } = useRestaurants()
  const selectedRestaurant = restaurants?.[0]?.id
  
  const { 
    reports, 
    isLoading: reportsLoading, 
    error, 
    refetch, 
    deleteReport, 
    downloadReport 
  } = useReports({ 
    restaurantId: selectedRestaurant, 
    limit: 2 
  })

  const isLoading = externalLoading || reportsLoading

  const handleViewReport = async (reportId: string) => {
    try {
      await downloadReport(reportId)
      toast.success('Report downloaded successfully')
    } catch (error) {
      toast.error('Failed to download report')
    }
  }

  const handleDeleteReport = async (reportId: string, reportTitle: string) => {
    if (confirm(`Are you sure you want to delete "${reportTitle}"?`)) {
      try {
        const success = await deleteReport(reportId)
        if (success) {
          toast.success('Report deleted successfully')
        } else {
          toast.error('Failed to delete report')
        }
      } catch (error) {
        toast.error('Failed to delete report')
      }
    }
  }

  const handleDownloadAllPDF = async () => {
    if (reports.length === 0) {
      toast.info('No reports available to download')
      return
    }

    setIsDownloading('all')
    try {
      // Create a combined report HTML
      const combinedContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Restaurant Reports</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .report-title { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .report-meta { color: #666; margin-bottom: 20px; }
            .report-section { margin: 30px 0; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
            .report-header { font-size: 18px; font-weight: bold; margin-bottom: 10px; color: #333; }
            .report-details { color: #666; margin-bottom: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="report-title">Restaurant Reports Summary</div>
            <div class="report-meta">
              Generated: ${new Date().toLocaleString()}<br>
              Total Reports: ${reports.length}
            </div>
          </div>
          ${reports.map(report => `
            <div class="report-section">
              <div class="report-header">${report.title}</div>
              <div class="report-details">
                Date: ${new Date(report.date).toLocaleDateString()}<br>
                Type: ${report.type}<br>
                Status: ${report.status}<br>
                Created: ${new Date(report.created_at).toLocaleString()}
              </div>
              ${report.description ? `<p>${report.description}</p>` : ''}
            </div>
          `).join('')}
        </body>
        </html>
      `

      // Create and download the combined report
      const blob = new Blob([combinedContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `restaurant_reports_${new Date().toISOString().split('T')[0]}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('All reports downloaded successfully')
    } catch (error) {
      toast.error('Failed to download reports')
    } finally {
      setIsDownloading(null)
    }
  }

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

  if (error) {
    return (
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-900 dark:text-white">Last Reports</span>
            <Button variant="ghost" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-400">Error loading reports</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{error}</p>
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
            {reports.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">No reports available</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Create your first report to get started</p>
              </div>
            ) : (
              reports.map((report) => (
                <div 
                  key={report.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {report.title}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Calendar className="h-3 w-3 text-gray-500" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(report.date).toLocaleDateString()}
                          </p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            report.status === 'completed' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : report.status === 'draft'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                          }`}>
                            {report.status}
                          </span>
                        </div>
                        {report.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                            {report.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewReport(report.id)}
                        disabled={isDownloading === report.id}
                      >
                        {isDownloading === report.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                        <span className="ml-1">View</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteReport(report.id, report.title)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
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
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleDownloadAllPDF}
            disabled={isDownloading === 'all' || reports.length === 0}
          >
            {isDownloading === 'all' ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Download PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
