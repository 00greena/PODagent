import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { calculateHours, getWeekNumber } from '@/lib/utils'
import * as XLSX from 'xlsx'

export async function GET(request: NextRequest) {
  try {
    const now = new Date()
    const currentWeek = getWeekNumber(now)
    const currentYear = now.getFullYear()

    // Get current week entries (Monday to Friday)
    const weekEntries = await prisma.pODEntry.findMany({
      where: {
        weekNumber: currentWeek,
        year: currentYear,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    // Group by day
    const dailyData: Record<string, any[]> = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
    }

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    weekEntries.forEach(entry => {
      const date = new Date(entry.createdAt)
      const dayName = dayNames[date.getDay()]
      
      if (dailyData[dayName]) {
        const hours = calculateHours(entry.timeIn, entry.timeOut)
        dailyData[dayName].push({
          date: date.toLocaleDateString('en-GB'),
          timeIn: entry.timeIn,
          timeOut: entry.timeOut,
          hours: hours.toFixed(2),
          deliveryAddress: entry.deliveryAddress || '',
          referenceNumber: entry.referenceNumber || '',
        })
      }
    })

    // Calculate totals
    let totalHours = 0
    const summaryData: any[] = []

    Object.entries(dailyData).forEach(([day, entries]) => {
      const dayHours = entries.reduce((sum, entry) => sum + parseFloat(entry.hours), 0)
      totalHours += dayHours

      summaryData.push({
        Day: day,
        'Number of Deliveries': entries.length,
        'Total Hours': dayHours.toFixed(2),
        'First Time In': entries[0]?.timeIn || '-',
        'Last Time Out': entries[entries.length - 1]?.timeOut || '-',
      })
    })

    // Create workbook with multiple sheets
    const wb = XLSX.utils.book_new()

    // Summary sheet
    const summarySheet = XLSX.utils.json_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Weekly Summary')

    // Add total row to summary
    XLSX.utils.sheet_add_json(summarySheet, [{
      Day: 'TOTAL',
      'Number of Deliveries': weekEntries.length,
      'Total Hours': totalHours.toFixed(2),
      'First Time In': '',
      'Last Time Out': '',
    }], { origin: -1, skipHeader: true })

    // Detailed entries for each day
    Object.entries(dailyData).forEach(([day, entries]) => {
      if (entries.length > 0) {
        const daySheet = XLSX.utils.json_to_sheet(entries)
        XLSX.utils.book_append_sheet(wb, daySheet, day)
      }
    })

    // All entries sheet
    const allEntriesData = weekEntries.map(entry => ({
      'Date': new Date(entry.createdAt).toLocaleDateString('en-GB'),
      'Day': dayNames[new Date(entry.createdAt).getDay()],
      'Time In': entry.timeIn,
      'Time Out': entry.timeOut,
      'Hours': calculateHours(entry.timeIn, entry.timeOut).toFixed(2),
      'Delivery Address': entry.deliveryAddress || '',
      'Reference Number': entry.referenceNumber || '',
    }))

    const allEntriesSheet = XLSX.utils.json_to_sheet(allEntriesData)
    XLSX.utils.book_append_sheet(wb, allEntriesSheet, 'All Entries')

    // Generate buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    // Return as downloadable file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="weekly-reconciliation-week${currentWeek}-${currentYear}.xlsx"`,
      },
    })
  } catch (error) {
    console.error('Reconcile error:', error)
    return NextResponse.json(
      { error: 'Failed to reconcile weekly data' },
      { status: 500 }
    )
  }
}