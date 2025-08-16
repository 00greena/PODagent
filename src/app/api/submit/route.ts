import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { extractTextFromImage, extractTextFromBlobUrl } from '@/lib/ocr'
import { sendNotificationEmail } from '@/lib/email'
import { getWeekNumber } from '@/lib/utils'
import { uploadBase64ToBlob, generateUniqueFilename } from '@/lib/blob'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { podImage, jobSheetImage, timeIn, timeOut, podFileName, jobSheetFileName } = body

    if (!podImage || !jobSheetImage || !timeIn || !timeOut) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate unique filenames
    const podBlobFilename = generateUniqueFilename(podFileName || 'pod.jpg', 'pod-')
    const jobSheetBlobFilename = generateUniqueFilename(jobSheetFileName || 'jobsheet.jpg', 'jobsheet-')

    // Upload images to Vercel Blob
    const podImageUrl = await uploadBase64ToBlob(podImage, podBlobFilename, 'image/jpeg')
    const jobSheetImageUrl = await uploadBase64ToBlob(jobSheetImage, jobSheetBlobFilename, 'image/jpeg')

    // Extract text from images using OCR (directly from blob URLs for better performance)
    const [podOCR, jobSheetOCR] = await Promise.all([
      extractTextFromBlobUrl(podImageUrl),
      extractTextFromBlobUrl(jobSheetImageUrl)
    ])

    // Combine extracted data
    const deliveryAddress = podOCR.deliveryAddress || jobSheetOCR.deliveryAddress
    const referenceNumber = podOCR.referenceNumber || jobSheetOCR.referenceNumber

    const now = new Date()
    const weekNumber = getWeekNumber(now)
    const year = now.getFullYear()

    // Save to database with blob URLs
    const entry = await prisma.pODEntry.create({
      data: {
        podImageUrl,
        jobSheetImageUrl,
        podFileName: podFileName || 'pod.jpg',
        jobSheetFileName: jobSheetFileName || 'jobsheet.jpg',
        timeIn,
        timeOut,
        deliveryAddress,
        referenceNumber,
        extractedData: {
          podText: podOCR.text,
          jobSheetText: jobSheetOCR.text,
          podImageUrl,
          jobSheetImageUrl,
        },
        weekNumber,
        year,
      },
    })

    // Send notification email
    await sendNotificationEmail({
      timeIn,
      timeOut,
      deliveryAddress,
      referenceNumber,
      date: now.toLocaleDateString('en-GB'),
    })

    return NextResponse.json({
      success: true,
      data: {
        id: entry.id,
        deliveryAddress,
        referenceNumber,
        podImageUrl,
        jobSheetImageUrl,
      },
    })
  } catch (error) {
    console.error('Submit error:', error)
    return NextResponse.json(
      { error: 'Failed to process submission' },
      { status: 500 }
    )
  }
}