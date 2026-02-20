'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function TestLoginPage() {
  const [email, setEmail] = useState('admin@restaurant.com')
  const [password, setPassword] = useState('demo123')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testLogin = async (endpoint: string) => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      setResult({
        endpoint,
        status: response.status,
        ok: response.ok,
        data
      })

      if (response.ok) {
        toast.success(`${endpoint} login successful!`)
      } else {
        toast.error(`${endpoint} login failed: ${data.error}`)
      }
    } catch (error) {
      setResult({
        endpoint,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      toast.error('Request failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Login</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@restaurant.com"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="demo123"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => testLogin('/api/auth/login')} 
                disabled={isLoading}
              >
                Test Normal Login
              </Button>
              <Button 
                onClick={() => testLogin('/api/debug-login')} 
                disabled={isLoading}
                variant="outline"
              >
                Test Debug Login
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
      </div>
    </div>
  )
}
