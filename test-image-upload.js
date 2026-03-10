/**
 * Test Image Upload Functionality
 * This script tests the image upload API endpoint
 */

async function testImageUpload() {
  console.log('Testing image upload functionality...')
  
  try {
    // Create a simple test image (1x1 pixel PNG)
    const testImageData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    const binaryData = atob(testImageData)
    const bytes = new Uint8Array(binaryData.length)
    for (let i = 0; i < binaryData.length; i++) {
      bytes[i] = binaryData.charCodeAt(i)
    }
    const blob = new Blob([bytes], { type: 'image/png' })
    const file = new File([blob], 'test.png', { type: 'image/png' })
    
    // Create form data
    const formData = new FormData()
    formData.append('file', file)
    
    console.log('Sending test image to upload API...')
    
    // Test upload
    const response = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      const error = await response.json()
      console.error('Upload failed:', error)
      return
    }
    
    const result = await response.json()
    console.log('Upload successful:', result)
    
    // Test delete
    console.log('Testing image deletion...')
    const deleteResponse = await fetch(`http://localhost:3000/api/upload?filename=${result.filename}`, {
      method: 'DELETE'
    })
    
    if (!deleteResponse.ok) {
      const error = await deleteResponse.json()
      console.error('Delete failed:', error)
      return
    }
    
    console.log('Delete successful')
    console.log('✅ Image upload system is working correctly!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test if this file is executed directly
if (typeof window === 'undefined' && require.main === module) {
  testImageUpload()
}

export { testImageUpload }
