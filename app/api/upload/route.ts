/**
 * @fileoverview Image Upload API Route
 * Handles file uploads for menu items and other images
 * 
 * POST /api/upload
 * Uploads an image file and returns the URL
 * 
 * Request: multipart/form-data with 'file' field
 * Response: { url: string } or error
 */

import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// Allowed file types
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const UPLOAD_DIR = 'public/uploads'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Allowed types: JPEG, PNG, GIF, WebP' 
      }, { status: 400 })
    }
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size: 5MB' 
      }, { status: 400 })
    }
    
    // Create upload directory if it doesn't exist
    const uploadPath = join(process.cwd(), UPLOAD_DIR)
    if (!existsSync(uploadPath)) {
      await mkdir(uploadPath, { recursive: true })
    }
    
    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const filename = `${timestamp}-${randomString}.${fileExtension}`
    
    // Save file
    const filePath = join(uploadPath, filename)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)
    
    // Return the URL (relative to public directory)
    const url = `/uploads/${filename}`
    
    return NextResponse.json({ 
      url,
      filename,
      size: file.size,
      type: file.type
    })
    
  } catch (error) {
    console.error('[Upload API] Error:', error)
    return NextResponse.json({ 
      error: 'Upload failed' 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('filename')
    
    if (!filename) {
      return NextResponse.json({ error: 'Filename required' }, { status: 400 })
    }
    
    // Security check: ensure filename doesn't contain path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 })
    }
    
    const filePath = join(process.cwd(), UPLOAD_DIR, filename)
    
    // Check if file exists before deleting
    if (existsSync(filePath)) {
      const fs = await import('fs/promises')
      await fs.unlink(filePath)
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }
    
  } catch (error) {
    console.error('[Upload API] Delete error:', error)
    return NextResponse.json({ 
      error: 'Delete failed' 
    }, { status: 500 })
  }
}
