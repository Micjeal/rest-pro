'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { Upload, X, Image as ImageIcon } from 'lucide-react'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onRemove?: () => void
  className?: string
  accept?: string
  maxSize?: number // in bytes
  disabled?: boolean
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  className = '',
  accept = 'image/jpeg,image/jpg,image/png,image/gif,image/webp',
  maxSize = 5 * 1024 * 1024, // 5MB
  disabled = false
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = accept.split(',')
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please select a valid image.')
      return
    }

    // Validate file size
    if (file.size > maxSize) {
      toast.error(`File too large. Maximum size: ${Math.round(maxSize / 1024 / 1024)}MB`)
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Simulate progress (since fetch doesn't provide progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const result = await response.json()
      onChange(result.url)
      toast.success('Image uploaded successfully!')
      
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemove = async () => {
    if (value && onRemove) {
      try {
        // Extract filename from URL
        const filename = value.split('/').pop()
        if (filename) {
          await fetch(`/api/upload?filename=${filename}`, {
            method: 'DELETE'
          })
        }
      } catch (error) {
        console.error('Delete error:', error)
        // Continue even if delete fails
      }
    }
    
    onRemove?.()
    onChange('')
    toast.success('Image removed')
  }

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-4">
        <Input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          disabled={disabled || isUploading}
          className="hidden"
        />
        
        <Button
          type="button"
          variant="outline"
          onClick={handleClick}
          disabled={disabled || isUploading}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          {isUploading ? 'Uploading...' : 'Choose Image'}
        </Button>

        {value && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleRemove}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
            Remove
          </Button>
        )}
      </div>

      {isUploading && (
        <div className="space-y-2">
          <Label>Upload Progress</Label>
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}

      {value ? (
        <div className="space-y-2">
          <Label>Preview</Label>
          <div className="relative inline-block">
            <img
              src={value}
              alt="Preview"
              className="h-32 w-32 object-cover rounded-md border"
              onError={(e) => {
                toast.error('Failed to load image preview')
                e.currentTarget.src = '/placeholder.jpg'
              }}
            />
          </div>
          <p className="text-sm text-muted-foreground break-all">
            {value}
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-center h-32 w-32 border-2 border-dashed border-muted-foreground/25 rounded-md">
          <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        Accepted formats: JPEG, PNG, GIF, WebP<br />
        Maximum size: {Math.round(maxSize / 1024 / 1024)}MB
      </div>
    </div>
  )
}
