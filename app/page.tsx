'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Users, ShoppingCart, BookOpen, Package, CheckCircle, ArrowRight, Star, TrendingUp, Zap, Shield, Globe, Quote, Award, CreditCard, Lock, ChevronRight, Play, Menu, Clock, MapPin, Phone, ChevronDown, Settings } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Home() {
  const [isVisible, setIsVisible] = useState(false)
  const [counters, setCounters] = useState({ restaurants: 0, orders: 0, uptime: 0 })
  const [reducedMotion, setReducedMotion] = useState(false)
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)

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
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 px-6 py-3 rounded-full text-sm font-medium mb-8 backdrop-blur-sm border border-amber-200/50 shadow-lg shadow-amber-500/10 hover:scale-105 transition-transform duration-300">
            <Award className="h-4 w-4 animate-pulse" />
            #1 Restaurant Management Platform 2024
            <Zap className="h-4 w-4 animate-bounce" />
          </div>
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            <span className={`block transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              Transform Your
            </span>
            <span className={`block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              Restaurant Business
            </span>
          </h1>
          <p className={`text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            The all-in-one restaurant management system trusted by thousands of establishments worldwide. 
            Increase revenue by 30%, reduce operational costs by 40%, and delight your customers like never before.
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
              Restaurants Worldwide
            </div>
            <div className="text-sm text-green-600 mt-2 font-medium">↑ 25% growth this year</div>
          </div>
          <div className={`text-center group transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
              ${counters.orders}M+
            </div>
            <div className="text-gray-600 flex items-center justify-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Orders Processed
            </div>
            <div className="text-sm text-green-600 mt-2 font-medium">↑ 40% increase</div>
          </div>
          <div className={`text-center group transition-all duration-1000 delay-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              {counters.uptime}%
            </div>
            <div className="text-gray-600 flex items-center justify-center gap-2">
              <Shield className="h-4 w-4" />
              Uptime Guarantee
            </div>
            <div className="text-sm text-green-600 mt-2 font-medium">Industry leading</div>
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

        {/* Testimonials Section */}
        <div className="mb-20">
          <div className={`text-center mb-16 transition-all duration-1000 delay-1700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Real stories from restaurant owners who transformed their business</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className={`group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg hover:-translate-y-2 bg-white/60 backdrop-blur-xl hover:bg-white/80 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000 delay-1800`}>
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <Quote className="h-8 w-8 text-blue-200 mb-4" />
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "This system completely transformed our restaurant operations. We've increased efficiency by 40% and our customers love the improved service speed."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                    JD
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">John Davidson</div>
                    <div className="text-sm text-gray-600">The Blue Plate Restaurant</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg hover:-translate-y-2 bg-white/60 backdrop-blur-xl hover:bg-white/80 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000 delay-1900`}>
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <Quote className="h-8 w-8 text-green-200 mb-4" />
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "The inventory management alone saved us thousands in waste. The analytics help us make data-driven decisions that boosted our profit margins."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                    SC
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Sarah Chen</div>
                    <div className="text-sm text-gray-600">Golden Dragon Bistro</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg hover:-translate-y-2 bg-white/60 backdrop-blur-xl hover:bg-white/80 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000 delay-2000`}>
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <Quote className="h-8 w-8 text-purple-200 mb-4" />
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "Best investment we've made. The reservation system eliminated no-shows by 90% and the staff scheduling feature is a game-changer."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                    MR
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Michael Rodriguez</div>
                    <div className="text-sm text-gray-600">La Bella Vista</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Trust Badges Section */}
        <div className="mb-20">
          <div className={`text-center mb-12 transition-all duration-1000 delay-2100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Trusted by Industry Leaders</h3>
          </div>
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center transition-all duration-1000 delay-2200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex items-center gap-2 text-gray-600 font-medium">
              <Lock className="h-5 w-5 text-green-600" />
              <span>PCI Compliant</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 font-medium">
              <Shield className="h-5 w-5 text-blue-600" />
              <span>GDPR Ready</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 font-medium">
              <CreditCard className="h-5 w-5 text-purple-600" />
              <span>Secure Payments</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 font-medium">
              <Award className="h-5 w-5 text-amber-600" />
              <span>ISO Certified</span>
            </div>
          </div>
        </div>

        {/* Interactive Demo Preview Section */}
        <div className="mb-20">
          <div className={`text-center mb-16 transition-all duration-1000 delay-2300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent mb-4">See It In Action</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Experience the power of our restaurant management system</p>
          </div>
          <div className={`relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-900 to-gray-800 transition-all duration-1000 delay-2400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20"></div>
            <div className="relative p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-white">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-400 text-sm ml-4">Restaurant Dashboard</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div className="flex items-center gap-3 mb-3">
                      <Menu className="h-5 w-5 text-blue-400" />
                      <span className="text-white font-medium">Today's Orders</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-300">Table 1 - 4 guests</span>
                        <span className="text-green-400">$87.50</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-300">Table 3 - 2 guests</span>
                        <span className="text-green-400">$45.00</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-300">Takeout #23</span>
                        <span className="text-green-400">$32.75</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div className="flex items-center gap-3 mb-3">
                      <Users className="h-5 w-5 text-green-400" />
                      <span className="text-white font-medium">Reservations</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-300">7:00 PM - Johnson Party</span>
                        <span className="text-blue-400">4 guests</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-300">8:30 PM - Smith Family</span>
                        <span className="text-blue-400">6 guests</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div className="flex items-center gap-3 mb-3">
                      <Package className="h-5 w-5 text-orange-400" />
                      <span className="text-white font-medium">Inventory Alerts</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-300">Tomatoes</span>
                        <span className="text-yellow-400">Low stock</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-300">Chicken Breast</span>
                        <span className="text-red-400">Order soon</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div className="flex items-center gap-3 mb-3">
                      <TrendingUp className="h-5 w-5 text-purple-400" />
                      <span className="text-white font-medium">Today's Revenue</span>
                    </div>
                    <div className="text-2xl font-bold text-green-400">$3,456.78</div>
                    <div className="text-sm text-gray-400">↑ 12% from yesterday</div>
                  </div>
                </div>
              </div>
              <div className="mt-8 text-center">
                <Link href="/login">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 transition-all duration-300 hover:scale-105 group">
                    <Play className="mr-2 h-4 w-4" />
                    Try Live Demo
                    <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="mb-20">
          <div className={`text-center mb-16 transition-all duration-1000 delay-2500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Choose the perfect plan for your restaurant size and needs</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className={`group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg hover:-translate-y-2 bg-white/60 backdrop-blur-xl hover:bg-white/80 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000 delay-2600`}>
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">Starter</CardTitle>
                <div className="text-4xl font-bold text-gray-900 mb-4">
                  $49<span className="text-lg text-gray-600">/month</span>
                </div>
                <p className="text-gray-600">Perfect for small restaurants and cafes</p>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-700">Up to 50 orders per day</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-700">Basic menu management</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-700">Simple inventory tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-700">Email support</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-400">
                    <div className="h-4 w-4 border border-gray-300 rounded-full"></div>
                    <span>Advanced analytics</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-400">
                    <div className="h-4 w-4 border border-gray-300 rounded-full"></div>
                    <span>API access</span>
                  </li>
                </ul>
                <Link href="/login">
                  <Button className="w-full" variant="outline">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className={`group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg hover:-translate-y-2 bg-gradient-to-br from-blue-600 to-indigo-600 text-white hover:scale-105 relative ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000 delay-2700`}>
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-amber-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
                MOST POPULAR
              </div>
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold text-white mb-2">Professional</CardTitle>
                <div className="text-4xl font-bold text-white mb-4">
                  $99<span className="text-lg text-blue-100">/month</span>
                </div>
                <p className="text-blue-100">Ideal for growing restaurants</p>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-200" />
                    <span className="text-white">Unlimited orders</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-200" />
                    <span className="text-white">Advanced menu management</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-200" />
                    <span className="text-white">Complete inventory system</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-200" />
                    <span className="text-white">Priority support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-200" />
                    <span className="text-white">Advanced analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-200" />
                    <span className="text-white">API access</span>
                  </li>
                </ul>
                <Link href="/login">
                  <Button className="w-full bg-white text-blue-600 hover:bg-gray-100">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className={`group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg hover:-translate-y-2 bg-white/60 backdrop-blur-xl hover:bg-white/80 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000 delay-2800`}>
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">Enterprise</CardTitle>
                <div className="text-4xl font-bold text-gray-900 mb-4">
                  $199<span className="text-lg text-gray-600">/month</span>
                </div>
                <p className="text-gray-600">For restaurant chains and large venues</p>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-700">Everything in Pro</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-700">Multi-location support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-700">Custom integrations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-700">Dedicated account manager</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-700">Custom reporting</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-700">White-label options</span>
                  </li>
                </ul>
                <Link href="/login">
                  <Button className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white hover:from-gray-800 hover:to-gray-700">
                    Contact Sales
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-20">
          <div className={`text-center mb-16 transition-all duration-1000 delay-2900 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Everything you need to know about our restaurant management system</p>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                question: "How quickly can I set up the system for my restaurant?",
                answer: "Most restaurants are fully set up and running within 24 hours. Our guided onboarding process helps you import menus, configure settings, and train your staff. We also provide personalized setup assistance for Enterprise customers."
              },
              {
                question: "Can I use the system on multiple devices?",
                answer: "Yes! Our system works seamlessly on tablets, smartphones, and desktop computers. Your staff can take orders on tablets, managers can view analytics on desktops, and you can monitor everything from your phone."
              },
              {
                question: "What happens if my internet connection goes down?",
                answer: "Our system includes offline mode functionality. Orders can continue to be taken locally and will automatically sync when your connection is restored. Critical data is backed up in real-time to prevent any loss."
              },
              {
                question: "Do you support multiple locations?",
                answer: "Absolutely! Our Professional and Enterprise plans support multiple restaurant locations. You can manage all locations from a single dashboard, transfer inventory between locations, and view consolidated reports."
              },
              {
                question: "How secure is my customer and business data?",
                answer: "We take security seriously. All data is encrypted using industry-standard AES-256 encryption, we're PCI compliant for payment processing, GDPR compliant for data protection, and conduct regular security audits. Your data is backed up daily across multiple secure servers."
              },
              {
                question: "Can I integrate with my existing systems?",
                answer: "Yes! We offer integrations with popular accounting software, payment processors, and delivery platforms. Our Enterprise plan includes custom API access and integration support for your specific needs."
              }
            ].map((faq, index) => (
              <Card 
                key={index}
                className={`transition-all duration-500 cursor-pointer hover:shadow-lg ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000 delay-${3000 + index * 100}`}
                onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 pr-4">{faq.question}</h3>
                    <ChevronDown 
                      className={`h-5 w-5 text-gray-500 transition-transform duration-300 flex-shrink-0 ${expandedFAQ === index ? 'rotate-180' : ''}`}
                    />
                  </div>
                  <div className={`mt-4 text-gray-600 leading-relaxed overflow-hidden transition-all duration-300 ${expandedFAQ === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    {faq.answer}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mb-20">
          <div className={`text-center mb-16 transition-all duration-1000 delay-3600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Get started in four simple steps and transform your restaurant today</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Sign Up",
                description: "Create your account in minutes and choose the perfect plan for your restaurant size.",
                icon: <Users className="h-6 w-6" />
              },
              {
                step: "2", 
                title: "Setup Menu",
                description: "Import your existing menu or create a new one with our easy-to-use menu builder.",
                icon: <BookOpen className="h-6 w-6" />
              },
              {
                step: "3",
                title: "Configure Settings",
                description: "Set up tables, payment methods, and staff roles to match your restaurant's workflow.",
                icon: <Settings className="h-6 w-6" />
              },
              {
                step: "4",
                title: "Start Selling",
                description: "Begin taking orders immediately and watch your efficiency and revenue grow.",
                icon: <TrendingUp className="h-6 w-6" />
              }
            ].map((step, index) => (
              <div 
                key={index}
                className={`text-center group transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000 delay-${3700 + index * 100}`}
              >
                <div className="relative mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 text-gray-900 rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
          <div className={`text-center mt-12 transition-all duration-1000 delay-4000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Link href="/login">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 group">
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform" />
              </Button>
            </Link>
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
