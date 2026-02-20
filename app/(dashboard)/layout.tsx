/**
 * Dashboard Layout
 * Main layout for POS and management screens
 * Includes sidebar navigation and main content area
 */

import { DashboardLayout } from '@/components/dashboard-layout'

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  )
}
