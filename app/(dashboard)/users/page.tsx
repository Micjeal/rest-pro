'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { UserForm, UserList } from '@/components/users'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import type { User } from '@/hooks/use-users'

export default function UsersPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | undefined>()
  const [userRole, setUserRole] = useState<string>('')
  const router = useRouter()
  const { toast } = useToast()

  // Check user role on mount
  useEffect(() => {
    const role = localStorage.getItem('userRole')
    setUserRole(role || '')

    // Redirect non-admin users
    if (role !== 'admin') {
      toast({
        title: 'Access Denied',
        description: 'Only administrators can access user management.',
        variant: 'destructive'
      })
      router.push('/dashboard')
      return
    }
  }, [router, toast])

  const handleCreateUser = () => {
    setEditingUser(undefined)
    setShowForm(true)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setShowForm(true)
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingUser(undefined)
    toast({
      title: 'Success',
      description: editingUser ? 'User updated successfully' : 'User created successfully'
    })
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingUser(undefined)
  }

  const handlePasswordGenerated = (password: string) => {
    toast({
      title: 'Password Generated',
      description: `New password: ${password}. Please save it securely.`
    })
  }

  // Show loading or access denied state while checking role
  if (!userRole) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking permissions...</p>
          </div>
        </div>
      </div>
    )
  }

  if (userRole !== 'admin') {
    return (
      <div className="container mx-auto py-8">
        <Alert className="max-w-2xl mx-auto">
          <AlertDescription className="text-center">
            You don't have permission to access this page. User management is only available to administrators.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-6 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 min-h-screen">
      {showForm ? (
        <div className="max-w-4xl mx-auto">
          <UserForm
            user={editingUser}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      ) : (
        <UserList
          onEditUser={handleEditUser}
          onCreateUser={handleCreateUser}
          onPasswordGenerated={handlePasswordGenerated}
        />
      )}
    </div>
  )
}
