'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Users, ShoppingCart, BookOpen, Package, CheckCircle, ArrowRight, Star, TrendingUp, Zap, Shield, Globe } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Home() {
  const [isVisible, setIsVisible] = useState(false)
  const [counters, setCounters] = useState({ restaurants: 0, orders: 0, uptime: 0 })
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)
    
    // Animate counters only if not reduced motion
    if (!mediaQuery.matches) {
      const timer = setTimeout(() => {
        setCounters({ restaurants: 10, orders: 50, uptime: 99.9 })
      }, 500)
      return () => clearTimeout(timer)
    } else {
      // Set counters immediately for reduced motion
      setCounters({ restaurants: 10, orders: 50, uptime: 99.9 })
    }
    
    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const getAnimationClass = (baseClass: string, delay: string = '') => {
    if (reducedMotion) return 'transition-opacity duration-300'
    return `${baseClass} ${delay}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className={`absolute top-20 left-20 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 ${reducedMotion ? '' : 'animate-pulse'}`}></div>
        <div className={`absolute top-40 right-20 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 ${reducedMotion ? '' : 'animate-pulse animation-delay-2000'}`}></div>
        <div className={`absolute bottom-20 left-1/2 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 ${reducedMotion ? '' : 'animate-pulse animation-delay-4000'}`}></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-32 left-10 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-2xl rotate-45" aria-hidden="true"></div>
      <div className="absolute top-64 right-16 w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl rotate-12" aria-hidden="true"></div>
      <div className="absolute bottom-32 left-20 w-24 h-24 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-full" aria-hidden="true"></div>
      {/* Header */}
      <header className="relative z-20 border-b border-gray-200/50 bg-white/60 backdrop-blur-xl sticky top-0 z-50 shadow-lg shadow-gray-500/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25 backdrop-blur-sm border border-white/20">
              <span className="font-bold text-white text-xl">R</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">Restaurant Manager</h1>
          </div>
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="outline" className="border-gray-300/50 hover:border-blue-500 hover:text-blue-600 hover:bg-white/80 transition-all duration-300 backdrop-blur-sm">
                Login
              </Button>
            </Link>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className={`text-center mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-6 py-3 rounded-full text-sm font-medium mb-8 backdrop-blur-sm border border-blue-200/50 shadow-lg shadow-blue-500/10 hover:scale-105 transition-transform duration-300">
            <Star className="h-4 w-4 animate-pulse" />
            Trusted by 1000+ Restaurants Worldwide
            <Zap className="h-4 w-4 animate-bounce" />
          </div>
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            <span className={`block transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              Manage Your Restaurant
            </span>
            <span className={`block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              with Ease
            </span>
          </h1>
          <p className={`text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            A complete restaurant management system to handle menus, orders, reservations, and inventory all in one place. 
            Streamline your operations and focus on what matters most - your customers.
          </p>
          <div className={`flex gap-4 justify-center transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-base px-8 py-4 h-auto border-2 hover:border-blue-500 hover:text-blue-600 transition-all duration-300 group backdrop-blur-sm bg-white/50 hover:bg-white hover:scale-105 hover:shadow-xl">
                Login to Access
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" className="text-base px-8 py-4 h-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 group hover:scale-105">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className={`text-center group transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              {counters.restaurants}K+
            </div>
            <div className="text-gray-600 flex items-center justify-center gap-2">
              <Globe className="h-4 w-4" />
              Active Restaurants
            </div>
          </div>
          <div className={`text-center group transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
              {counters.orders}M+
            </div>
            <div className="text-gray-600 flex items-center justify-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Orders Processed
            </div>
          </div>
          <div className={`text-center group transition-all duration-1000 delay-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              {counters.uptime}%
            </div>
            <div className="text-gray-600 flex items-center justify-center gap-2">
              <Shield className="h-4 w-4" />
              Uptime
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-20">
          <div className={`text-center mb-16 transition-all duration-1000 delay-900 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Everything you need to run your restaurant efficiently</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className={`group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg hover:-translate-y-2 bg-white/60 backdrop-blur-xl hover:bg-white/80 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000 delay-1000`}>
              <CardHeader>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg shadow-blue-500/25">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl group-hover:text-blue-600 transition-colors duration-300">Menu Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  Create and manage multiple menus with items, descriptions, and pricing. Update in real-time across all locations.
                </p>
              </CardContent>
            </Card>

            <Card className={`group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg hover:-translate-y-2 bg-white/60 backdrop-blur-xl hover:bg-white/80 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000 delay-1100`}>
              <CardHeader>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-green-600 mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg shadow-green-500/25">
                  <ShoppingCart className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl group-hover:text-green-600 transition-colors duration-300">Order Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  Track orders from creation to completion with status updates and real-time notifications.
                </p>
              </CardContent>
            </Card>

            <Card className={`group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg hover:-translate-y-2 bg-white/60 backdrop-blur-xl hover:bg-white/80 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000 delay-1200`}>
              <CardHeader>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg shadow-purple-500/25">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl group-hover:text-purple-600 transition-colors duration-300">Reservations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  Manage table reservations and customer information efficiently with automated reminders.
                </p>
              </CardContent>
            </Card>

            <Card className={`group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg hover:-translate-y-2 bg-white/60 backdrop-blur-xl hover:bg-white/80 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000 delay-1300`}>
              <CardHeader>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg shadow-orange-500/25">
                  <Package className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl group-hover:text-orange-600 transition-colors duration-300">Inventory Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  Monitor stock levels and get alerts when items run low. Track waste and optimize purchasing.
                </p>
              </CardContent>
            </Card>

            <Card className={`group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg hover:-translate-y-2 bg-white/60 backdrop-blur-xl hover:bg-white/80 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000 delay-1400`}>
              <CardHeader>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg shadow-indigo-500/25">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl group-hover:text-indigo-600 transition-colors duration-300">Real-time Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  See live updates across all your restaurant operations with instant synchronization.
                </p>
              </CardContent>
            </Card>

            <Card className={`group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg hover:-translate-y-2 bg-white/60 backdrop-blur-xl hover:bg-white/80 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000 delay-1500`}>
              <CardHeader>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-600 mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg shadow-red-500/25">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl group-hover:text-red-600 transition-colors duration-300">Analytics & Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  Get detailed insights into your business performance with comprehensive reports.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className={`rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-12 py-16 text-center shadow-2xl backdrop-blur-xl border border-white/20 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000 delay-1600 relative overflow-hidden`}>
          {/* Animated background elements for CTA */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl animate-pulse animation-delay-2000"></div>
          </div>
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to transform your restaurant?</h2>
            <p className="text-blue-100 text-lg mb-10 leading-relaxed">
              Join thousands of restaurant owners who have already streamlined their operations with our comprehensive management system.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-base px-8 py-4 h-auto border-2 border-white/30 text-white hover:bg-white hover:text-blue-600 transition-all duration-300 hover:scale-105 hover:shadow-xl backdrop-blur-sm">
                  Login to Access
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="secondary" className="text-base px-8 py-4 h-auto bg-white text-blue-600 hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200/50 bg-white/60 backdrop-blur-xl mt-20">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Restaurant Manager. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(45deg); }
          50% { transform: translateY(-20px) rotate(45deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(12deg); }
          50% { transform: translateY(-15px) rotate(12deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}
