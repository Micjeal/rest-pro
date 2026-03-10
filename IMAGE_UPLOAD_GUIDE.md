# Image Upload System Documentation

## Overview
The restaurant system now supports image uploads for menu items and other entities. This document explains how to use the new image functionality.

## Features Added
- **Menu Item Images**: Upload, display, and manage images for menu items
- **Reusable Components**: `ImageUpload` and `ImagePreview` components
- **API Endpoints**: Upload and delete images via REST API
- **File Validation**: Type, size, and dimension validation
- **Error Handling**: Comprehensive error handling and user feedback

## Database Changes
Run the migration in `database-plans/add-image-support.sql` to add the `image_url` column to the `menu_items` table:

```sql
ALTER TABLE menu_items ADD COLUMN image_url TEXT;
```

## API Endpoints

### POST /api/upload
Uploads an image file and returns the URL.

**Request**: `multipart/form-data` with `file` field
**Response**: 
```json
{
  "url": "/uploads/filename.jpg",
  "filename": "filename.jpg",
  "size": 123456,
  "type": "image/jpeg"
}
```

**Validation**:
- Allowed types: JPEG, PNG, GIF, WebP
- Maximum size: 5MB
- Maximum dimensions: 2048x2048px

### DELETE /api/upload?filename=<filename>
Deletes an uploaded image file.

**Response**: 
```json
{
  "success": true
}
```

## Components

### ImageUpload Component
Reusable component for uploading images with preview and validation.

```tsx
import { ImageUpload } from '@/components/ui/image-upload'

<ImageUpload
  value={imageUrl}
  onChange={(url) => setImageUrl(url)}
  onRemove={() => setImageUrl('')}
  maxSize={5 * 1024 * 1024} // Optional: custom max size
/>
```

**Props**:
- `value?: string` - Current image URL
- `onChange: (url: string) => void` - Called when image is uploaded
- `onRemove?: () => void` - Called when image is removed
- `maxSize?: number` - Maximum file size in bytes
- `disabled?: boolean` - Disable upload functionality

### ImagePreview Component
Displays images with preview modal and optional controls.

```tsx
import { ImagePreview } from '@/components/ui/image-preview'

<ImagePreview
  src={imageUrl}
  alt="Menu item image"
  size="md"
  showControls={true}
  onDelete={() => handleDelete()}
  onDownload={() => handleDownload()}
/>
```

**Props**:
- `src: string` - Image URL
- `alt?: string` - Alt text
- `size?: 'sm' | 'md' | 'lg'` - Display size
- `showControls?: boolean` - Show hover controls
- `onDelete?: () => void` - Delete callback
- `onDownload?: () => void` - Download callback

## Usage Examples

### Menu Item Form with Image
The `MenuItemForm` component now includes image upload functionality:

```tsx
// In components/menu-item-form.tsx
const [formData, setFormData] = useState({
  name: '',
  description: '',
  price: '',
  availability: true,
  image_url: '', // New field
})

const handleImageChange = (url: string) => {
  setFormData(prev => ({ ...prev, image_url: url }))
}

// In the form:
<ImageUpload
  value={formData.image_url}
  onChange={handleImageChange}
  onRemove={() => setFormData(prev => ({ ...prev, image_url: '' }))}
/>
```

### Displaying Menu Items with Images
The `MenuItemsList` component now displays images:

```tsx
// In components/menu-items-list.tsx
{item.image_url ? (
  <ImagePreview
    src={item.image_url}
    alt={item.name}
    size="sm"
  />
) : (
  <div className="h-16 w-16 border-2 border-dashed border-muted-foreground/25 rounded-md">
    <span className="text-xs text-muted-foreground">No image</span>
  </div>
)}
```

## File Structure
```
public/
  uploads/           # Uploaded images (auto-created)
    image1.jpg
    image2.png
    ...

components/
  ui/
    image-upload.tsx    # Upload component
    image-preview.tsx   # Preview component

lib/
  upload-utils.ts      # Utility functions and config

app/
  api/
    upload/
      route.ts         # Upload API endpoint
```

## Configuration
Image upload settings are configured in `lib/upload-utils.ts`:

```typescript
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  UPLOAD_DIR: 'public/uploads',
  MAX_WIDTH: 2048,
  MAX_HEIGHT: 2048,
}
```

## Security Considerations
- Files are validated for type and size
- Filenames are sanitized and made unique
- Path traversal attacks are prevented
- Files are stored in the public uploads directory

## Error Handling
The system provides comprehensive error handling:
- File type validation errors
- File size validation errors
- Upload failure handling
- Image preview error handling
- API error responses

## Testing
Use the test script to verify the upload system:

```bash
node test-image-upload.js
```

## Next Steps
To extend the system for orders:
1. Add image columns to orders table
2. Update orders API endpoints
3. Add image upload to order forms
4. Display images in order details

## Troubleshooting

### Common Issues
1. **Upload fails with "File too large"**: Reduce file size or increase `MAX_FILE_SIZE`
2. **Image doesn't display**: Check if the uploads directory exists and is accessible
3. **Permission errors**: Ensure the uploads directory has write permissions
4. **Invalid file type**: Use only JPEG, PNG, GIF, or WebP formats

### Debug Tips
- Check browser console for upload errors
- Verify the uploads directory exists: `ls public/uploads`
- Check API response in network tab
- Review server logs for upload errors

## Browser Support
- Modern browsers with File API support
- Drag and drop support (can be added to ImageUpload component)
- Image preview with modal functionality
