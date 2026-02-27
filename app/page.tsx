'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, Award, Zap } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Home() {
  const [isVisible, setIsVisible] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)
    
    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Simplified Animated Background Elements */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className={`absolute top-20 left-20 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 ${reducedMotion ? '' : 'animate-pulse'}`}></div>
        <div className={`absolute top-40 right-20 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 ${reducedMotion ? '' : 'animate-pulse animation-delay-2000'}`}></div>
      </div>

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
        <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
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
      </main>
    </div>
  )
}
