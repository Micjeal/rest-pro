'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogTrigger, DialogTitle, VisuallyHidden } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ZoomIn, Download, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface ImagePreviewProps {
  src: string
  alt?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showControls?: boolean
  onDelete?: () => void
  onDownload?: () => void
  fullWidth?: boolean // New prop for full-width usage
}

const sizeClasses = {
  sm: 'h-16 w-16',
  md: 'h-24 w-24',
  lg: 'h-32 w-32'
}

export function ImagePreview({
  src,
  alt = 'Image',
  className = '',
  size = 'md',
  showControls = false,
  onDelete,
  onDownload,
  fullWidth = false
}: ImagePreviewProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleDownload = () => {
    if (onDownload) {
      onDownload()
    } else {
      // Default download behavior
      const link = document.createElement('a')
      link.href = src
      link.download = alt || 'image'
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete()
    }
  }

  const handleImageError = () => {
    setImageError(true)
    console.error('Failed to load image:', src)
  }

  if (imageError) {
    return (
      <div className={`${fullWidth ? 'w-full h-full' : sizeClasses[size]} border-2 border-dashed border-muted-foreground/25 rounded-md flex items-center justify-center ${className}`}>
        <span className="text-xs text-muted-foreground text-center px-2">
          Failed to load
        </span>
      </div>
    )
  }

  return (
    <div className={`relative ${fullWidth ? 'w-full h-full' : 'inline-block'} ${className}`}>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <div className="cursor-pointer group w-full h-full">
            <img
              src={src}
              alt={alt}
              className={`${fullWidth ? 'w-full h-full' : sizeClasses[size]} object-cover rounded-md border transition-transform group-hover:scale-105`}
              onError={handleImageError}
            />
            {showControls && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsOpen(true)
                  }}
                >
                  <ZoomIn className="h-3 w-3" />
                </Button>
                {onDownload && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDownload()
                    }}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete()
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <VisuallyHidden>
            <DialogTitle>Image Preview: {alt}</DialogTitle>
          </VisuallyHidden>
          <div className="relative">
            <img
              src={src}
              alt={alt}
              className="w-full h-full object-contain rounded-lg"
              onError={handleImageError}
            />
            <div className="absolute bottom-4 right-4 flex gap-2">
              {onDownload && (
                <Button size="sm" variant="secondary" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}
              {onDelete && (
                <Button size="sm" variant="destructive" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Gallery component for multiple images
interface ImageGalleryProps {
  images: Array<{
    src: string
    alt?: string
    id?: string
  }>
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showControls?: boolean
  onDelete?: (id: string) => void
  onDownload?: (id: string) => void
}

export function ImageGallery({
  images,
  className = '',
  size = 'md',
  showControls = false,
  onDelete,
  onDownload
}: ImageGalleryProps) {
  if (images.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No images available
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
      {images.map((image) => (
        <ImagePreview
          key={image.id || image.src}
          src={image.src}
          alt={image.alt}
          size={size}
          showControls={showControls}
          onDelete={onDelete ? () => onDelete(image.id || image.src) : undefined}
          onDownload={onDownload ? () => onDownload(image.id || image.src) : undefined}
        />
      ))}
    </div>
  )
}
