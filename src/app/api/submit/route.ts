import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { extractTextFromImage } from '@/lib/ocr'
import { sendNotificationEmail } from '@/lib/email'
import { getWeekNumber } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { podImage, jobSheetImage, timeIn, timeOut } = body

    if (!podImage || !jobSheetImage || !timeIn || !timeOut) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Extract text from images using OCR
    const podOCR = await extractTextFromImage(podImage)
    const jobSheetOCR = await extractTextFromImage(jobSheetImage)

    // Combine extracted data
    const deliveryAddress = podOCR.deliveryAddress || jobSheetOCR.deliveryAddress
    const referenceNumber = podOCR.referenceNumber || jobSheetOCR.referenceNumber

    const now = new Date()
    const weekNumber = getWeekNumber(now)
    const year = now.getFullYear()

    // Save to database
    const entry = await prisma.pODEntry.create({
      data: {
        podImage,
        jobSheetImage,
        timeIn,
        timeOut,
        deliveryAddress,
        referenceNumber,
        extractedData: {
          podText: podOCR.text,
          jobSheetText: jobSheetOCR.text,
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