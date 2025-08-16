import { createWorker } from 'tesseract.js'

export async function extractTextFromImage(imageBase64: string): Promise<{
  text: string
  deliveryAddress?: string
  referenceNumber?: string
}> {
  try {
    // Remove data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    
    // Create Tesseract worker
    const worker = await createWorker('eng')
    
    // Perform OCR
    const { data: { text } } = await worker.recognize(Buffer.from(base64Data, 'base64'))
    
    // Terminate worker
    await worker.terminate()
    
    // Extract key information using regex patterns
    const deliveryAddress = extractAddress(text)
    const referenceNumber = extractReferenceNumber(text)
    
    return {
      text,
      deliveryAddress,
      referenceNumber
    }
  } catch (error) {
    console.error('OCR error:', error)
    return {
      text: '',
      deliveryAddress: undefined,
      referenceNumber: undefined
    }
  }
}

function extractAddress(text: string): string | undefined {
  // Common patterns for addresses
  const addressPatterns = [
    /(?:deliver(?:y)?|ship(?:ping)? to|address)[:\s]+([^\n]+(?:\n[^\n]+)?)/i,
    /\d+\s+[\w\s]+(?:street|st|avenue|ave|road|rd|lane|ln|drive|dr|court|ct|place|pl|boulevard|blvd)[^\n]*/i,
    /[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,?\s+[A-Z]{2}\s+\d{5}(?:-\d{4})?/,
  ]
  
  for (const pattern of addressPatterns) {
    const match = text.match(pattern)
    if (match) {
      return match[1] || match[0]
    }
  }
  
  return undefined
}

function extractReferenceNumber(text: string): string | undefined {
  // Common patterns for reference numbers
  const refPatterns = [
    /(?:ref(?:erence)?|order|tracking|job|delivery)[\s#:]+([A-Z0-9\-]+)/i,
    /\b[A-Z]{2,4}[\-]?\d{6,10}\b/,
    /\b\d{10,}\b/,
  ]
  
  for (const pattern of refPatterns) {
    const match = text.match(pattern)
    if (match) {
      return match[1] || match[0]
    }
  }
  
  return undefined
}