'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { getDestinationForRole, getRoleDescription } from './role-based-routing'

/**
 * LoginForm Component
 * Handles user authentication with email and password
 * Supports role-based login (admin, manager, cashier)
 * Modernized with enhanced design
 */
export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log('[LoginForm] Attempting login for:', email)

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('[LoginForm] Login failed:', data.error)
        toast.error(data.error || 'Login failed')
        setIsLoading(false)
        return
      }

      console.log('[LoginForm] Login successful for user:', email)
      toast.success('Login successful!')

      // Store token and user role in localStorage
      if (data.token) {
        localStorage.setItem('auth_token', data.token)
      }
      if (data.user?.role) {
        localStorage.setItem('userRole', data.user.role)
        localStorage.setItem('userName', data.user.name)
      }

      // Get role-based destination
      const role = data.user?.role
      const destination = getDestinationForRole(role as any)
      const roleDescription = getRoleDescription(role as any)
      
      console.log(`[LoginForm] Redirecting ${role} to: ${destination} (${roleDescription})`)
      
      // Show role-specific success message
      toast.success(`Welcome! Redirecting to ${roleDescription}...`)
      
      // Redirect to role-specific page
      router.push(destination)
    } catch (error) {
      console.error('[LoginForm] Error:', error)
      toast.error('An error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl border-0">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
        <CardDescription className="text-gray-500">Enter your credentials to access the POS system</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="h-11 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="h-11 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </Button>
        </form>

        <div className="mt-6 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border border-blue-100">
          <p className="text-sm font-semibold text-blue-900 mb-3">Demo Credentials:</p>
          <div className="space-y-2">
            <div className="bg-white/50 rounded-lg p-2">
              <p className="text-xs font-medium text-blue-800">👑 Administrator</p>
              <p className="text-xs text-blue-700"><span className="font-medium">Email:</span> admin@restaurant.com</p>
              <p className="text-xs text-blue-700"><span className="font-medium">Password:</span> demo123</p>
            </div>
            <div className="bg-white/50 rounded-lg p-2">
              <p className="text-xs font-medium text-blue-800">👨‍🍳 Head Chef</p>
              <p className="text-xs text-blue-700"><span className="font-medium">Email:</span> chef@restaurant.com</p>
              <p className="text-xs text-blue-700"><span className="font-medium">Password:</span> demo123</p>
            </div>
            <div className="bg-white/50 rounded-lg p-2">
              <p className="text-xs font-medium text-blue-800">🍽 Server</p>
              <p className="text-xs text-blue-700"><span className="font-medium">Email:</span> server@restaurant.com</p>
              <p className="text-xs text-blue-700"><span className="font-medium">Password:</span> demo123</p>
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-2 italic">Each role redirects to their specific workspace</p>
        </div>
      </CardContent>
    </Card>
  )
}
