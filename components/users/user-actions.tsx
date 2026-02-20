'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { MoreHorizontal, Edit, Trash2, Key, Shield } from 'lucide-react'
import { useDeleteUser, generatePassword, useUpdateUser } from '@/hooks/use-users'
import { getRoleBadgeColor, getRoleLabel, type RestaurantRole } from '@/components/users/role-definitions'
import type { User as UserType } from '@/hooks/use-users'
import { toast } from 'sonner'

interface UserActionsProps {
  user: UserType
  onEdit?: (user: UserType) => void
  onPasswordGenerated?: (password: string) => void
}

export function UserActions({ user, onEdit, onPasswordGenerated }: UserActionsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [isResettingPassword, setIsResettingPassword] = useState(false)

  const { deleteUser, isLoading } = useDeleteUser()
  const { updateUser } = useUpdateUser()

  const handleDelete = async () => {
    try {
      await deleteUser(user.id)
      setDeleteDialogOpen(false)
    } catch (error) {
      console.error('Delete user error:', error)
    }
  }

  const handleResetPassword = async () => {
    setIsResettingPassword(true)
    try {
      const password = generatePassword()
      setNewPassword(password)
      
      // Update the user's password in the database
      await updateUser(user.id, { password })
      
      toast.success(`Password reset successfully for ${user.name}`)
      setResetPasswordDialogOpen(true)
    } catch (error) {
      console.error('Reset password error:', error)
      toast.error('Failed to reset password')
    } finally {
      setIsResettingPassword(false)
    }
  }

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(newPassword)
    onPasswordGenerated?.(newPassword)
    toast.success('Password copied to clipboard')
    setResetPasswordDialogOpen(false)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit?.(user)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit User
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleResetPassword} disabled={isResettingPassword}>
            <Key className="mr-2 h-4 w-4" />
            {isResettingPassword ? 'Resetting...' : 'Reset Password'}
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => setDeleteDialogOpen(true)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account
              for <strong>{user.name}</strong> ({user.email}).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Deleting...
                </>
              ) : (
                'Delete User'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Password Dialog */}
      <AlertDialog open={resetPasswordDialogOpen} onOpenChange={setResetPasswordDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Password</AlertDialogTitle>
            <AlertDialogDescription>
              A new password has been generated for <strong>{user.name}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="my-4 p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">New Password</p>
                <p className="font-mono text-lg">{newPassword}</p>
              </div>
              <Button
                onClick={handleCopyPassword}
                className="flex items-center gap-2"
              >
                Copy & Close
              </Button>
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

interface UserBadgeProps {
  role: RestaurantRole
  className?: string
}

export function UserBadge({ role, className = '' }: UserBadgeProps) {
  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <Badge className={getRoleBadgeColor(role)}>
        {getRoleLabel(role)}
      </Badge>
    </div>
  )
}

interface UserStatusProps {
  user: UserType
  className?: string
}

export function UserStatus({ user, className = '' }: UserStatusProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2)
  }

  const getAvatarColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500'
      case 'manager':
        return 'bg-blue-500'
      case 'cashier':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`flex items-center justify-center w-10 h-10 rounded-full text-white font-semibold ${getAvatarColor(user.role)}`}>
        {getInitials(user.name)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{user.name}</p>
        <p className="text-sm text-gray-500 truncate">{user.email}</p>
      </div>
      <UserBadge role={user.role as RestaurantRole} />
    </div>
  )
}
