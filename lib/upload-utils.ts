/**
 * Upload Configuration and Utility Functions
 * Centralized configuration for image uploads and helper functions
 */

// Upload configuration
export const UPLOAD_CONFIG = {
  // File size limits (in bytes)
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_MENU_ITEM_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_ORDER_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB (for receipts, etc.)
  
  // Allowed file types
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_EXTENSIONS: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  
  // Upload directory
  UPLOAD_DIR: 'public/uploads',
  BASE_URL: '/uploads',
  
  // Image dimensions (for validation/resizing)
  MAX_WIDTH: 2048,
  MAX_HEIGHT: 2048,
  THUMBNAIL_SIZE: 300,
  
  // Quality settings
  JPEG_QUALITY: 0.8,
  WEBP_QUALITY: 0.8,
}

// Utility functions
export function validateImageFile(file: File, maxSize: number = UPLOAD_CONFIG.MAX_FILE_SIZE): { valid: boolean; error?: string } {
  // Check file type
  if (!UPLOAD_CONFIG.ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${UPLOAD_CONFIG.ALLOWED_TYPES.join(', ')}`
    }
  }
  
  // Check file extension
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (!extension || !UPLOAD_CONFIG.ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `Invalid file extension. Allowed extensions: ${UPLOAD_CONFIG.ALLOWED_EXTENSIONS.join(', ')}`
    }
  }
  
  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${Math.round(maxSize / 1024 / 1024)}MB`
    }
  }
  
  return { valid: true }
}

export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 8)
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg'
  return `${timestamp}-${randomString}.${extension}`
}

export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({
        width: img.width,
        height: img.height
      })
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }
    
    img.src = url
  })
}

export async function validateImageDimensions(file: File): Promise<{ valid: boolean; error?: string }> {
  try {
    const { width, height } = await getImageDimensions(file)
    
    if (width > UPLOAD_CONFIG.MAX_WIDTH || height > UPLOAD_CONFIG.MAX_HEIGHT) {
      return {
        valid: false,
        error: `Image dimensions too large. Maximum: ${UPLOAD_CONFIG.MAX_WIDTH}x${UPLOAD_CONFIG.MAX_HEIGHT}px`
      }
    }
    
    return { valid: true }
  } catch (error) {
    return {
      valid: false,
      error: 'Failed to validate image dimensions'
    }
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function getUploadUrl(filename: string): string {
  return `${UPLOAD_CONFIG.BASE_URL}/${filename}`
}

export function extractFilenameFromUrl(url: string): string {
  return url.split('/').pop() || ''
}

export function isImageUrl(url: string): boolean {
  if (!url) return false
  
  // Check if it's a valid image URL format
  const imagePattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i
  const uploadPattern = /^\/uploads\/.+\.(jpg|jpeg|png|gif|webp)$/i
  
  return imagePattern.test(url) || uploadPattern.test(url)
}

// Error handling utilities
export class UploadError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message)
    this.name = 'UploadError'
  }
}

export function handleUploadError(error: any): { error: string; statusCode: number } {
  if (error instanceof UploadError) {
    return {
      error: error.message,
      statusCode: error.statusCode || 500
    }
  }
  
  if (error.code === 'ENOENT') {
    return {
      error: 'File not found',
      statusCode: 404
    }
  }
  
  if (error.code === 'EACCES') {
    return {
      error: 'Permission denied',
      statusCode: 403
    }
  }
  
  if (error.code === 'ENOSPC') {
    return {
      error: 'Storage full',
      statusCode: 507
    }
  }
  
  return {
    error: error.message || 'Upload failed',
    statusCode: 500
  }
}
