import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import './globals.css'
import { SidebarProvider } from '@/hooks/use-sidebar'
import { CurrencyProvider } from '@/contexts/CurrencyContext'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Restaurant Management System',
  description: 'A comprehensive restaurant management system for menus, orders, reservations, and inventory',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // DEBUG: Log layout rendering
  console.log('[RootLayout] Rendering, children type:', typeof children)
  
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <SidebarProvider>
          <CurrencyProvider>
            {children}
          </CurrencyProvider>
        </SidebarProvider>
      </body>
    </html>
  )
}
