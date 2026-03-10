'use client'

import { useState, useEffect, useCallback } from 'react'
import { Report } from '@/app/api/reports/route'

interface UseReportsOptions {
  restaurantId?: string | null
  limit?: number
  type?: 'monthly' | 'weekly' | 'daily' | 'custom'
  enabled?: boolean
}

interface UseReportsReturn {
  reports: Report[]
  isLoading: boolean
  error: string | null
  setupRequired: boolean
  refetch: () => void
  createReport: (reportData: Partial<Report>) => Promise<Report | null>
  deleteReport: (reportId: string) => Promise<boolean>
  downloadReport: (reportId: string) => Promise<void>
}

export function useReports({
  restaurantId,
  limit = 10,
  type,
  enabled = true
}: UseReportsOptions = {}): UseReportsReturn {
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [setupRequired, setSetupRequired] = useState(false)

  const fetchReports = useCallback(async () => {
    if (!enabled) return

    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (restaurantId) params.append('restaurantId', restaurantId)
      if (limit) params.append('limit', limit.toString())
      if (type) params.append('type', type)

      const response = await fetch(`/api/reports?${params.toString()}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        
        // Check if setup is required
        if (errorData.setup_required) {
          setSetupRequired(true)
          return
        }
        
        throw new Error(`Failed to fetch reports: ${response.statusText}`)
      }

      const data = await response.json()
      setReports(data.reports || [])
      setSetupRequired(false)
      
      console.log('[Reports Hook] Fetched reports:', data.reports?.length || 0)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch reports'
      setError(errorMessage)
      console.error('[Reports Hook] Error:', errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [restaurantId, limit, type, enabled])

  const createReport = useCallback(async (reportData: Partial<Report>): Promise<Report | null> => {
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      })

      if (!response.ok) {
        throw new Error(`Failed to create report: ${response.statusText}`)
      }

      const data = await response.json()
      const newReport = data.report

      // Add the new report to the local state
      setReports(prev => [newReport, ...prev])
      
      console.log('[Reports Hook] Created report:', newReport.id)
      return newReport
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create report'
      setError(errorMessage)
      console.error('[Reports Hook] Error creating report:', errorMessage)
      return null
    }
  }, [])

  const deleteReport = useCallback(async (reportId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/reports?id=${reportId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`Failed to delete report: ${response.statusText}`)
      }

      // Remove the report from local state
      setReports(prev => prev.filter(report => report.id !== reportId))
      
      console.log('[Reports Hook] Deleted report:', reportId)
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete report'
      setError(errorMessage)
      console.error('[Reports Hook] Error deleting report:', errorMessage)
      return false
    }
  }, [])

  const downloadReport = useCallback(async (reportId: string): Promise<void> => {
    try {
      // First get the report details
      const response = await fetch(`/api/reports?id=${reportId}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch report: ${response.statusText}`)
      }

      const data = await response.json()
      const report = data.report

      if (report.file_url) {
        // If file exists, download it
        window.open(report.file_url, '_blank')
      } else {
        // Generate and download PDF on the fly
        await generateAndDownloadPDF(report)
      }
      
      console.log('[Reports Hook] Downloaded report:', reportId)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download report'
      setError(errorMessage)
      console.error('[Reports Hook] Error downloading report:', errorMessage)
    }
  }, [])

  const generateAndDownloadPDF = async (report: Report): Promise<void> => {
    // Create a simple HTML content for the report
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${report.title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .report-title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .report-meta { color: #666; margin-bottom: 20px; }
          .content { margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="report-title">${report.title}</div>
          <div class="report-meta">
            Date: ${new Date(report.date).toLocaleDateString()}<br>
            Type: ${report.type}<br>
            Generated: ${new Date(report.created_at).toLocaleString()}
          </div>
        </div>
        <div class="content">
          ${report.description ? `<p>${report.description}</p>` : ''}
          <p>This is a ${report.type} report generated on ${new Date(report.created_at).toLocaleDateString()}.</p>
        </div>
      </body>
      </html>
    `

    // Create a blob and download
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${report.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  return {
    reports,
    isLoading,
    error,
    setupRequired,
    refetch: fetchReports,
    createReport,
    deleteReport,
    downloadReport,
  }
}
