'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Database, CheckCircle, AlertTriangle } from 'lucide-react'

export default function ReportsSetupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string }>()

  const handleSetup = async () => {
    setIsLoading(true)
    setResult(undefined)

    try {
      const response = await fetch('/api/setup-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: data.message || 'Reports table setup completed successfully!'
        })
      } else {
        setResult({
          success: false,
          error: data.error || 'Failed to setup reports table'
        })
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Reports Database Setup
            </CardTitle>
            <CardDescription>
              The reports table needs to be created in your database to enable the reports functionality.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This will create the necessary database table and insert sample data for testing the reports feature.
              </AlertDescription>
            </Alert>

            {result && (
              <Alert className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                {result.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={result.success ? 'text-green-800' : 'text-red-800'}>
                  {result.success ? result.message : result.error}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-4">
              <Button 
                onClick={handleSetup} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up reports table...
                  </>
                ) : (
                  'Setup Reports Table'
                )}
              </Button>

              {result?.success && (
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/reports'}
                  className="w-full"
                >
                  Go to Reports
                </Button>
              )}
            </div>

            {!result?.success && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Manual Setup Instructions:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                  <li>Go to your Supabase dashboard</li>
                  <li>Navigate to SQL Editor</li>
                  <li>Copy and execute the SQL from <code className="bg-gray-200 px-1 rounded">database-plans/create-reports-table.sql</code></li>
                  <li>The table will be created with sample data</li>
                </ol>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
