import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import * as XLSX from 'xlsx'

export async function GET(request: NextRequest) {
  try {
    // Fetch all entries
    const entries = await prisma.pODEntry.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Prepare data for Excel
    const excelData = entries.map((entry: any) => ({
      'Date': new Date(entry.createdAt).toLocaleDateString('en-GB'),
      'Time In': entry.timeIn,
      'Time Out': entry.timeOut,
      'Delivery Address': entry.deliveryAddress || '',
      'Reference Number': entry.referenceNumber || '',
      'Week Number': entry.weekNumber,
      'Year': entry.year,
    }))

    // Create workbook
    const ws = XLSX.utils.json_to_sheet(excelData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'POD Entries')

    // Generate buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    // Return as downloadable file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="pod-entries-${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    )
  }
}