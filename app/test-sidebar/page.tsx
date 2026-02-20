'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { SidebarToggle } from '@/components/sidebar-toggle'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useSidebar } from '@/hooks/use-sidebar'

export default function TestSidebarPage() {
  const { isDesktopCollapsed, toggleDesktopSidebar } = useSidebar()

  return (
    <DashboardLayout 
      title="Sidebar Toggle Test" 
      subtitle="Test the new toggle sidebar functionality"
      headerAction={
        <div className="flex items-center gap-2">
          <SidebarToggle />
          <Button onClick={toggleDesktopSidebar}>
            {isDesktopCollapsed ? 'Expand' : 'Collapse'}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Sidebar Toggle Test</CardTitle>
            <CardDescription>
              This page tests the new toggle sidebar functionality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="font-medium">Current State:</span>
              <span className={`px-2 py-1 rounded text-sm ${
                isDesktopCollapsed 
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                  : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              }`}>
                {isDesktopCollapsed ? 'Collapsed' : 'Expanded'}
              </span>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Test Instructions:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>Click the toggle button in the header to collapse/expand the sidebar</li>
                <li>Use the keyboard shortcut Ctrl/Cmd + B to toggle the sidebar</li>
                <li>Hover over collapsed menu items to see tooltips</li>
                <li>Check that the main content area adjusts its margin</li>
                <li>Refresh the page to verify state persistence</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Features Implemented:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>✅ Enhanced sidebar context with desktop toggle state</li>
                <li>✅ Dynamic layout with responsive sidebar width</li>
                <li>✅ Collapsible sidebar with icon-only mode</li>
                <li>✅ Tooltips for collapsed menu items</li>
                <li>✅ Keyboard shortcut support (Ctrl/Cmd + B)</li>
                <li>✅ State persistence using localStorage</li>
                <li>✅ Smooth transitions and animations</li>
                <li>✅ Mobile behavior preserved</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
