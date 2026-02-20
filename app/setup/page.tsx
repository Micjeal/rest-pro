'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function SetupPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSetup = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/setup-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Setup failed')
      }

      toast.success('Database setup completed successfully!')
      console.log('Setup result:', data)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Setup failed'
      toast.error(errorMessage)
      console.error('Setup error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Database Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            This will create the users table and insert sample users with the following credentials:
          </p>
          
          <div className="bg-gray-100 p-3 rounded text-sm">
            <p><strong>Email:</strong> admin@restaurant.com</p>
            <p><strong>Password:</strong> demo123</p>
            <p><strong>Role:</strong> admin</p>
          </div>

          <Button 
            onClick={handleSetup} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Setting up...' : 'Setup Database'}
          </Button>
          
          <p className="text-xs text-gray-500 text-center">
            After setup, you can login with these credentials.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
