'use client'

import { LoginForm } from '@/components/auth/login-form'
import { useEffect } from 'react'
import { Store } from 'lucide-react'

/**
 * Login Page
 * Route: /login
 * Allows users to authenticate into the POS system
 * Simplified with clean centered layout
 */
export default function LoginPage() {
  useEffect(() => {
    console.log('[Login] Page loaded')
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg mb-4">
            <Store className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Restaurant Manager</h1>
          <p className="text-gray-600 text-sm mt-1">Sign in to access your system</p>
        </div>

        {/* Login Form */}
        <LoginForm />
      </div>
    </div>
  )
}
