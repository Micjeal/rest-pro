'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Key, Shield, Eye, EyeOff, RefreshCw } from 'lucide-react'
import { useCreateUser, useUpdateUser, generatePassword } from '@/hooks/use-users'
import { 
  ROLE_DEFINITIONS, 
  getRoleBadgeColor, 
  getRoleLabel, 
  getRolesByCategory,
  type RestaurantRole 
} from '@/components/users/role-definitions'
import type { User as UserType, CreateUserData, UpdateUserData } from '@/hooks/use-users'

interface UserFormProps {
  user?: UserType
  onSuccess?: () => void
  onCancel?: () => void
}

export function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const [formData, setFormData] = useState({
    email: user?.email || '',
    name: user?.name || '',
    role: user?.role || 'cashier' as RestaurantRole,
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { createUser, isLoading: isCreating } = useCreateUser()
  const { updateUser, isLoading: isUpdating } = useUpdateUser()

  const isLoading = isCreating || isUpdating

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    // Password validation (only for new users)
    if (!user && !formData.password) {
      newErrors.password = 'Password is required for new users'
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      if (user) {
        // Update existing user
        const updateData: UpdateUserData = {
          email: formData.email,
          name: formData.name,
          role: formData.role
        }

        // Only include password if it's provided
        if (formData.password) {
          updateData.password = formData.password
        }

        await updateUser(user.id, updateData)
      } else {
        // Create new user
        const createData: CreateUserData = {
          email: formData.email,
          name: formData.name,
          role: formData.role,
          password: formData.password
        }

        await createUser(createData)
      }

      onSuccess?.()
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  const handleGeneratePassword = () => {
    const newPassword = generatePassword()
    setFormData(prev => ({ ...prev, password: newPassword }))
    setShowPassword(true)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {user ? 'Edit User' : 'Create New User'}
        </CardTitle>
        <CardDescription>
          {user 
            ? 'Update user information and role assignments'
            : 'Add a new user to the restaurant management system'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="user@restaurant.com"
              className={errors.email ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Full Name
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="John Doe"
              className={errors.name ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Role Field */}
          <div className="space-y-2">
            <Label htmlFor="role" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              User Role
            </Label>
            <Select
              value={formData.role}
              onValueChange={(value: RestaurantRole) => 
                handleInputChange('role', value)
              }
              disabled={isLoading}
            >
              <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {['Management', 'Kitchen', 'Front of House', 'Support'].map(category => (
                  <div key={category}>
                    <div className="px-2 py-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800">
                      {category}
                    </div>
                    {getRolesByCategory(category).map(roleDef => (
                      <SelectItem key={roleDef.value} value={roleDef.value}>
                        <div className="flex items-center gap-2 py-1">
                          <Badge className={getRoleBadgeColor(roleDef.value)}>
                            {roleDef.label}
                          </Badge>
                          <div className="flex-1">
                            <div className="text-sm font-medium">{roleDef.label}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {roleDef.description}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-red-500">{errors.role}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Password
              {!user && <span className="text-red-500">*</span>}
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder={user ? 'Leave blank to keep current password' : 'Enter password'}
                  className={errors.password ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {!user && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGeneratePassword}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Generate
                </Button>
              )}
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
            {!user && (
              <p className="text-sm text-gray-500">
                Password must be at least 6 characters long
              </p>
            )}
          </div>

          {/* Current Role Display (for editing) */}
          {user && (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Currently editing: <strong>{user.name}</strong> 
                <Badge className={`ml-2 ${getRoleBadgeColor(user.role)}`}>
                  {getRoleLabel(user.role)}
                </Badge>
              </AlertDescription>
            </Alert>
          )}

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {user ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  {user ? 'Update User' : 'Create User'}
                </>
              )}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
