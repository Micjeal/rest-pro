'use client'

import { LoginForm } from '@/components/auth/login-form'
import { useEffect } from 'react'
import { ArrowRight, Shield, Clock, Users } from 'lucide-react'

/**
 * Login Page
 * Route: /login
 * Allows users to authenticate into the POS system
 * Modernized with two-column layout
 */
export default function LoginPage() {
  useEffect(() => {
    console.log('[Login] Page loaded')
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="min-h-screen flex">
        {/* Left Column - Login Form */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
              <p className="text-gray-600">Sign in to access your restaurant management system</p>
            </div>
            <LoginForm />
          </div>
        </div>

        {/* Right Column - Branding */}
        <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

          <div className="relative z-10 flex flex-col justify-center px-12 py-16 text-white">
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-8">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-sm border-2 border-white/30 shadow-2xl">
                  <span className="font-bold text-white text-3xl">R</span>
                </div>
                <div>
                  <h2 className="text-4xl font-bold mb-2">Restaurant Manager</h2>
                  <p className="text-blue-100 text-lg">Restaurant Management & Point of Sale</p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex-shrink-0">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Secure & Reliable</h3>
                  <p className="text-blue-100 leading-relaxed">
                    Enterprise-grade security with encrypted data transmission and secure authentication protocols.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex-shrink-0">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Real-time Updates</h3>
                  <p className="text-blue-100 leading-relaxed">
                    Instant synchronization across all devices ensures your team always has the latest information.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex-shrink-0">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Team Collaboration</h3>
                  <p className="text-blue-100 leading-relaxed">
                    Role-based access control allows your team to work efficiently with appropriate permissions.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-16">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                <p className="text-lg font-medium mb-2">Join thousands of restaurants</p>
                <p className="text-blue-100 mb-4">
                  Trusted by restaurant owners worldwide to streamline their operations and boost efficiency.
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="bg-white/20 px-3 py-1 rounded-full">✓ 24/7 Support</span>
                  <span className="bg-white/20 px-3 py-1 rounded-full">✓ Free Updates</span>
                  <span className="bg-white/20 px-3 py-1 rounded-full">✓ Easy Setup</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
