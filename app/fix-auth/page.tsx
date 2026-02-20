'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function FixAuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const fixRLS = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/fix-rls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()
      setResult(data)

      if (response.ok) {
        toast.success('RLS policies fixed successfully!')
      } else {
        toast.error(`Failed to fix RLS: ${data.error}`)
      }
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' })
      toast.error('Failed to fix RLS')
    } finally {
      setIsLoading(false)
    }
  }

  const createAdmin = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()
      setResult(data)

      if (response.ok) {
        toast.success('Admin user created successfully!')
      } else {
        toast.error(`Failed to create admin: ${data.error}`)
      }
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' })
      toast.error('Failed to create admin')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Fix Authentication</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              This page will fix RLS policies and create the admin user to resolve login issues.
            </p>
            
            <div className="flex gap-2">
              <Button onClick={fixRLS} disabled={isLoading}>
                Fix RLS Policies
              </Button>
              <Button onClick={createAdmin} disabled={isLoading} variant="outline">
                Create Admin User
              </Button>
            </div>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Result</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Login Credentials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="font-semibold">After fixing:</p>
              <p>Email: admin@restaurant.com</p>
              <p>Password: demo123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
