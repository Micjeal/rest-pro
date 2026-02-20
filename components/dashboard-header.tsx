'use client'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function DashboardHeader() {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
            <span className="font-bold text-white">R</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Restaurant Manager</h1>
        </div>
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="text-sm"
        >
          Sign Out
        </Button>
      </div>
    </header>
  )
}
