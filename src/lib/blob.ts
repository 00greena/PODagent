import { put } from '@vercel/blob'

export async function uploadFileToBlob(file: File, filename: string): Promise<string> {
  try {
    const blob = await put(filename, file, {
      access: 'public',
    })
    
    return blob.url
  } catch (error) {
    console.error('Blob upload error:', error)
    throw new Error('Failed to upload file to blob storage')
  }
}

export async function uploadBase64ToBlob(base64Data: string, filename: string, mimeType: string): Promise<string> {
  try {
    // Remove data URL prefix if present
    const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '')
    
    // Convert base64 to buffer
    const buffer = Buffer.from(cleanBase64, 'base64')
    
    // Upload to Vercel Blob
    const blob = await put(filename, buffer, {
      access: 'public',
      contentType: mimeType,
    })
    
    return blob.url
  } catch (error) {
    console.error('Blob upload error:', error)
    throw new Error('Failed to upload file to blob storage')
  }
}

export function generateUniqueFilename(originalName: string, prefix: string = ''): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const extension = originalName.split('.').pop() || 'jpg'
  
  return `${prefix}${timestamp}-${random}.${extension}`
}