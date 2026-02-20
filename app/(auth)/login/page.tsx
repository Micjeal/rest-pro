'use client'

import { LoginForm } from '@/components/auth/login-form'
import { useEffect } from 'react'

/**
 * Login Page
 * Route: /login
 * Allows users to authenticate into the POS system
 * Modernized with enhanced design
 */
export default function LoginPage() {
  useEffect(() => {
    console.log('[Login] Page loaded')
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 w-full px-4">
        <div className="mb-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
              <span className="font-bold text-white text-2xl">P</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">POS System</h1>
          <p className="text-blue-200 text-lg">Restaurant Management & Point of Sale</p>
        </div>

        <div className="flex justify-center">
          <LoginForm />
        </div>

        <div className="mt-8 max-w-md mx-auto bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-4 text-center">
          <p className="text-sm text-blue-100">This is a demonstration system. Use the provided demo credentials to log in.</p>
        </div>
      </div>
    </div>
  )
}
